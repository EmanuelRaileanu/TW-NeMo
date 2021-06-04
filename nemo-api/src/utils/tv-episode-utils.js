import APIError from '../../../shared-utilities/APIError.js'

export const checkTableArrays = (body) => {
    if (body.actorIds && !Array.isArray(body.actorIds)) {
        throw new APIError(`req.body.actorIds must be an array, got ${typeof body.actorIds}`, 400)
    }

}

export const attachToEpisode= async (episode, body, t = null) => {
    if (body.actorIds) {
        await episode.actors().detach(episode.related('actors').map(actor => actor.id), { transacting: t })
        await episode.actors().attach(body.actorIds, { transacting: t })
    }
    if (body.directorIds) {
        await episode.episodes().detach(episode.related('directors').map(director => director.id), { transacting: t })
        await episode.episodes().attach(body.directorIds, { transacting: t })
    }

}

export const detachAll = async (episode, t = null) => {
    await episode.actors().detach(episode.related('actors').map(actor => actor.id), { transacting: t })
    await episode.episodes().detach(episode.related('directors').map(director => director.id), { transacting: t })
}