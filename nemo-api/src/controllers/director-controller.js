import Director from "../models/director.js";
import APIError from "../../../shared-utilities/APIError.js";
import Bookshelf from "../bookshelf.js";
import {detachAll, attachToDirector, checkTableArrays} from "../utils/director-utils.js";

class DirectorController {
    static relatedObject = {
        movies: q => {
            q.select('id', 'title')
        },
        tvShows: q => {
            q.select('id', 'title')
        }
    }
    static minimalColumns = ['name', 'gender', 'placeOfBirth', 'movieIds', 'tvShowIds', 'birthDate']

    static async getDirectors(req, res) {
        const directors = await new Director().query(q => {
            if (req.query.searchBy && req.query.searchBy !== {}) {
                q.where('directors.name', 'like', `%${req.query.searchBy}%`)
            }
            q.orderBy('directors.name', 'ASC')

        }).fetchPage({
            require: false,
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20
        })
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify({
            results: directors.toJSON({omitPivot: true}),
            pagination: directors.pagination
        }))
    }

    static async getDirectorById(req, res) {
        const director = await new Director({id: req.params.directorId}).fetch({
            require: false,
            withRelated: [DirectorController.relatedObject],
        })
        if (!director) {
            throw new APIError('There is no director with this id', 404)
        }
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify(director.toJSON({omitPivot: true})))
    }

    static async updateDirector(req, res) {
        const director = await new Director({id: req.params.directorId}).fetch({
            require: false,
            withRelated: [DirectorController.relatedObject]
        })
        if (!director) {
            throw new APIError('There is no director with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const updateBody = await director.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            await director.save(updateBody, {method: 'update', patch: 'true', transacting: t})
            await attachToDirector(director, req.body, t)
        })
        const updatedDirector = await new director({id: req.params.directorId}).fetch({
            require: false,
            withRelated: [DirectorController.relatedObject]
        })
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify(updatedDirector.toJSON({omitPivot: true})))
    }

    static async addDirector(req, res) {
        let director = await new Director().query(q => {
            q.where('directors.name', 'like', `${req.body.title}`)
        }).fetch({require: false})
        if (director) {
            throw new APIError('There is already a director with this name', 409)
        }
        director = new Director()
        const columns = Object.keys(req.body)
        if (!DirectorController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${DirectorController.minimalColumns}`, 400)
        }
        const addBody = await director.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            director = await new director(addBody).save(null, {method: 'insert', transacting: t})
            await attachToDirector(director, req.body, t)
        })
        director = await director.fetch({require: false, withRelated: [DirectorController.relatedObject]})
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify(director.toJSON({omitPivot: true})))
    }

    static async deleteDirector(req, res) {
        const director = await new Director({id: req.params.directorId}).fetch({
            require: false,
            withRelated: [DirectorController.relatedObject]
        })
        if (!director) {
            throw new APIError('There is no director with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await detachAll(director, t)
            await director.destroy({transacting: t})
        })
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify({message: "Director successfully deleted"}))
    }
}

export default DirectorController