import APIError from "../../../shared-utilities/APIError.js";
import {attachToEpisode, checkTableArrays, detachAll} from "../utils/tv-episode-utils.js";
import Bookshelf from "../bookshelf.js";
import TvEpisode from "../models/tv-episode.js";
import TvSeason from '../models/tv-season.js'


class TvEpisodeController{
    static relatedObject = {
        actors: q => {
            q.select('id', 'name')
        },
        directors: q => {
            q.select('id', 'name')
        }
    }
    static minimalColumns = ['title', 'description', 'airDate', 'seasonId','episodeNumber']

    static async getEpisodeById (req, res) {
        const episode = await new TvEpisode({ id: req.params.episodeId }).fetch({
            require: false,
            withRelated: [TvEpisodeController.relatedObject]
        })
        if (!episode) {
            throw new APIError('There is no episode with this id', 404)
        }
        return res.end(JSON.stringify(episode.toJSON({ omitPivot: true })))
    }

    static async updateEpisode (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const episode = await new TvEpisode({ id: req.params.episodeId }).fetch({
            require: false,
            withRelated: [TvEpisodeController.relatedObject]
        })
        if (!episode) {
            throw new APIError('There is no episode with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const updateBody = await episode.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            await episode.save(updateBody, { method: 'update', patch: 'true', transacting: t })
            await attachToEpisode(episode, req.body, t)
        })
        const updatedEpisode = await new TvEpisode({ id: req.params.episodeId }).fetch({
            require: false,
            withRelated: [TvEpisodeController.relatedObject]
        })
        return res.end(JSON.stringify(updatedEpisode.toJSON({ omitPivot: true })))
    }

    static async addEpisode (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const tvSeason = await new TvSeason({ id: req.body.tvSeasonId }).fetch({ require: false })
        if (!tvSeason) {
            throw new APIError(`There is no tv show with the id ${req.body.tvSeasonId}`, 404)
        }
        let episode = await new TvEpisode().query(q => {
            q.where('tv_episodes.name', 'like', `${req.body.title}`, 'and','tv_episodes.seasonId',`${req.body.tvSeasonId}`)
        }).fetch({ require: false })
        if (episode) {
            throw new APIError('There is already an episode with this name', 409)
        }
        episode = new TvEpisode()
        const columns = Object.keys(req.body)
        if (!TvEpisodeController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${TvEpisodeController.minimalColumns}`, 400)
        }
        const addBody = await episode.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            episode = await new TvEpisode(addBody).save(null, { method: 'insert', transacting: t })
            await attachToEpisode(episode, req.body, t)
        })
        episode = await episode.fetch({ require: false, withRelated: [TvEpisodeController.relatedObject] })
        return res.end(JSON.stringify(episode.toJSON({ omitPivot: true })))
    }

    static async deleteEpisode (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const episode = await new TvEpisode({ id: req.params.episodeId }).fetch({
            require: false,
            withRelated: [TvEpisodeController.relatedObject]
        })
        if (!episode) {
            throw new APIError('There is no episode with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await detachAll(episode, t)
            await episode.destroy({ transacting: t })
        })
        return res.end(JSON.stringify({ message: "Episode successfully deleted" }))
    }
}

export default TvEpisodeController