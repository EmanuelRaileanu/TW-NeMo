import TvShow from "../models/tv-show.js";
import APIError from "../../../shared-utilities/APIError.js";
import {attachToSeason, checkTableArrays, detachAll} from "../utils/tv-season-utils.js";
import Bookshelf from "../bookshelf.js";
import TvSeason from "../models/tv-season.js";


class TvSeasonController{
    static relatedObject = {
        episodes: q => {
            q.select('id', 'name')
        }
    }
    static minimalColumns = ['title', 'description', 'airDate', 'tvShowId','seasonNumber']

    static async getSeasonsOf(req,res){
        const seasons =await new TvSeason().query(q => {
            console.log(req.params.tvShowId)
            q.where('tv_seasons.tvShowId','like',`${req.params.tvShowId}`)
            q.orderBy('tv_seasons.seasonNumber','ASC')
        }).fetchPage({
            require: false,
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20
        })
        console.log(seasons.toJSON())
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(seasons.toJSON({ omitPivot: true })))
    }

    static async getSeasonById (req, res) {
        const season = await new TvSeason({ id: req.params.seasonId }).fetch({
            require: false,
            withRelated: [TvSeasonController.relatedObject]
        })
        if (!season) {
            throw new APIError('There is no season with this id', 404)
        }
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(season.toJSON({ omitPivot: true })))
    }

    static async updateSeason (req, res) {
        const season = await new TvSeason({ id: req.params.seasonId }).fetch({
            require: false,
            withRelated: [TvSeasonController.relatedObject]
        })
        if (!season) {
            throw new APIError('There is no season with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const updateBody = await season.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            await season.save(updateBody, { method: 'update', patch: 'true', transacting: t })
            await attachToSeason(season, req.body, t)
        })
        const updatedSeason = await new TvShow({ id: req.params.seasonId }).fetch({
            require: false,
            withRelated: [TvSeasonController.relatedObject]
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(updatedSeason.toJSON({ omitPivot: true })))
    }

    static async addSeason (req, res) {
        let season = await new TvSeason().query(q => {
            q.where('tv_seasons.title', 'like', `${req.body.title}`, 'and','tv_seasons.tvShowId',`${req.body.tvShowId}`)
        }).fetch({ require: false })
        if (season) {
            throw new APIError('There is already a season with this name', 409)
        }
        season = new TvSeason()
        const columns = Object.keys(req.body)
        if (!TvSeasonController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${TvSeasonController.minimalColumns}`, 400)
        }
        const addBody = await season.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            season = await new TvSeason(addBody).save(null, { method: 'insert', transacting: t })
            await attachToSeason(season, req.body, t)
        })
        season = await season.fetch({ require: false, withRelated: [TvSeasonController.relatedObject] })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(season.toJSON({ omitPivot: true })))
    }

    static async deleteSeason (req, res) {
        const season = await new TvSeason({ id: req.params.seasonId }).fetch({
            require: false,
            withRelated: [TvSeasonController.relatedObject]
        })
        if (!season) {
            throw new APIError('There is no season with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await detachAll(season, t)
            await season.destroy({ transacting: t })
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify({ message: "TV season successfully deleted" }))
    }
}

export default TvSeasonController