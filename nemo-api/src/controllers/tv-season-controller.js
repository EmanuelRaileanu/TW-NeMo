import TvShow from "../models/tv-show.js";
import APIError from "../../../shared-utilities/APIError.js";
import { checkTableArrays, detachAll } from "../utils/tv-season-utils.js";
import Bookshelf from "../bookshelf.js";
import TvSeason from "../models/tv-season.js";


class TvSeasonController {
    static relatedObject = {
        episodes: q => {
            q.select('id', 'seasonId', 'name')
        }
    }
    static minimalColumns = ['title', 'description', 'airDate', 'tvShowId', 'seasonNumber']

    static async getSeasonById (req, res) {
        const season = await new TvSeason({ id: req.params.seasonId }).fetch({
            require: false,
            withRelated: [TvSeasonController.relatedObject]
        })
        if (!season) {
            throw new APIError('There is no season with this id', 404)
        }
        return res.end(JSON.stringify(season.toJSON({ omitPivot: true })))
    }

    static async updateSeason (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
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
        await season.save(updateBody, { method: 'update', patch: 'true' })
        const updatedSeason = await new TvShow({ id: req.params.seasonId }).fetch({
            require: false,
            withRelated: [TvSeasonController.relatedObject]
        })
        return res.end(JSON.stringify(updatedSeason.toJSON({ omitPivot: true })))
    }

    static async addSeason (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const tvShow = await new TvShow({ id: req.body.tvShowId }).fetch({ require: false })
        if (!tvShow) {
            throw new APIError(`There is no tv show with the id ${req.body.tvShowId}`, 404)
        }
        let season = await new TvSeason().query(q => {
            q.where('tv_seasons.title', 'like', `${req.body.title}`, 'and', 'tv_seasons.tvShowId', `${req.body.tvShowId}`)
        }).fetch({ require: false })
        if (season) {
            throw new APIError('There is already a season with this name', 409)
        }
        const columns = Object.keys(req.body)
        if (!TvSeasonController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${TvSeasonController.minimalColumns}`, 400)
        }
        const addBody = await season.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        season = await new TvSeason(addBody).save(null, { method: 'insert' })
        return res.end(JSON.stringify(season.toJSON({ omitPivot: true })))
    }

    static async deleteSeason (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
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
        return res.end(JSON.stringify({ message: "TV season successfully deleted" }))
    }
}

export default TvSeasonController