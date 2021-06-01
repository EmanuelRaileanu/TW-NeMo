import APIError from "../../../shared-utilities/APIError.js";

export const checkTableArrays = (body) => {
    if (body.movieIds && !Array.isArray(body.movieIds)) {
        throw new APIError(`req.body.movieIds must be an array, got ${typeof body.movieIds}`, 400)
    }
    if (body.tvShowIds && !Array.isArray(body.tvShowIds)) {
        throw new APIError(`req.body.showIds must be an array, got ${typeof body.tvShowIds}`, 400)
    }
}

export const attachToActor = async (actor, body, t = null) => {
    if (body.movieIds) {
        await actor.movies().detach(actor.related('movies').map(movie => movie.id), { transacting: t })
        await actor.movies().attach(body.movieIds, { transacting: t })
    }
    if (body.tvShowIds) {
        await actor.tvShows().detach(actor.related('tvShows').map(show => show.id), { transacting: t })
        await actor.tvShows().attach(body.tvShowIds, { transacting: t })
    }
}

export const detachAll = async (actor, t = null) => {
    await actor.movies().detach(actor.related('movies').map(movie => movie.id), { transacting: t })
    await actor.tvShows().detach(actor.related('tvShows').map(show => show.id), { transacting: t })
}