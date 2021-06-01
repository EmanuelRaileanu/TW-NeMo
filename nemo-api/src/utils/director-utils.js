import APIError from '../../../shared-utilities/APIError.js'

export const checkTableArrays = (body) => {
    if (body.movieIds && !Array.isArray(body.movieIds)) {
        throw new APIError(`req.body.movieIds must be an array, got ${typeof body.movieIds}`, 400)
    }
    if (body.tvShowIds && !Array.isArray(body.tvShowIds)) {
        throw new APIError(`req.body.showIds must be an array, got ${typeof body.tvShowIds}`, 400)
    }
}

export const attachToDirector = async (director, body, t = null) => {
    if (body.movieIds) {
        await director.movies().detach(director.related('movies').map(movie => movie.id), { transacting: t })
        await director.movies().attach(body.movieIds, { transacting: t })
    }
    if (body.tvShowIds) {
        await director.tvShows().detach(director.related('tvShows').map(show => show.id), { transacting: t })
        await director.tvShows().attach(body.tvShowIds, { transacting: t })
    }
}

export const detachAll = async (director, t = null) => {
    await director.movies().detach(director.related('movies').map(movie => movie.id), { transacting: t })
    await director.tvShows().detach(director.related('tvShows').map(show => show.id), { transacting: t })
}