import Actor from '../models/actor.js'
import APIError from '../../../shared-utilities/APIError.js'
import Bookshelf from '../bookshelf.js'
import { attachToActor, checkTableArrays, detachAll } from '../utils/actor-utils.js'

class ActorController {
    static relatedObject = {
        movies: q => {
            q.select('id', 'title')
        },
        tvShows: q => {
            q.select('id', 'title')
        }
    }
    static minimalColumns = ['name', 'gender', 'placeOfBirth', 'movieIds', 'tvShowIds', 'birthDate']

    static async getActors (req, res) {
        const actors = await new Actor().query(q => {
            if (req.query.searchBy && req.query.searchBy !== {}) {
                q.where('actors.name', 'like', `%${req.query.searchBy}%`)
            }
            q.orderBy('actors.name', 'ASC')

        }).fetchPage({
            require: false,
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify({
            results: actors.toJSON({ omitPivot: true }),
            pagination: actors.pagination
        }))
    }

    static async getActorById (req, res) {
        console.log("am intrat")
        const actor = await new Actor({ id: req.params.actorId }).fetch({
            require: false,
            withRelated: [ActorController.relatedObject]
        })
        if (!actor) {
            throw new APIError('There is no actor with this id', 404)
        }
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(actor.toJSON({ omitPivot: true })))
    }

    static async updateActor (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const actor = await new Actor({ id: req.params.actorId }).fetch({
            require: false,
            withRelated: [ActorController.relatedObject]
        })
        if (!actor) {
            throw new APIError('There is no actor with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const updateBody = await actor.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            await actor.save(updateBody, { method: 'update', patch: 'true', transacting: t })
            await attachToActor(actor, req.body, t)
        })
        const updatedActor = await new Actor({ id: req.params.actorId }).fetch({
            require: false,
            withRelated: [ActorController.relatedObject]
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(updatedActor.toJSON({ omitPivot: true })))
    }

    static async addActor (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        let actor = await new Actor().query(q => {
            q.where('actors.name', 'like', `${req.body.title}`)
        }).fetch({ require: false })
        if (actor) {
            throw new APIError('There is already an actor with this name', 409)
        }
        actor = new Actor()
        const columns = Object.keys(req.body)
        if (!ActorController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${ActorController.minimalColumns}`, 400)
        }
        const addBody = await actor.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            actor = await new Actor(addBody).save(null, { method: 'insert', transacting: t })
            await attachToActor(actor, req.body, t)
        })
        actor = await actor.fetch({ require: false, withRelated: [ActorController.relatedObject] })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(actor.toJSON({ omitPivot: true })))
    }

    static async deleteActor (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const actor = await new Actor({ id: req.params.actorId }).fetch({
            require: false,
            withRelated: [ActorController.relatedObject]
        })
        if (!actor) {
            throw new APIError('There is no actor with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await detachAll(actor, t)
            await actor.destroy({ transacting: t })
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify({ message: "Actor successfully deleted" }))
    }
}

export default ActorController