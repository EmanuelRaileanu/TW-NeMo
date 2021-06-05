import APIError from '../../../shared-utilities/APIError.js'

export const checkTableArrays = (body) => {
    if (body.actorIds && !Array.isArray(body.actorIds)) {
        throw new APIError(`req.body.actorIds must be an array, got ${typeof body.actorIds}`, 400)
    }

}

export const detachAll = async (season, t = null) => {
    await season.episodes().detach(season.related('episodes').map(episode => episode.id), { transacting: t })
}