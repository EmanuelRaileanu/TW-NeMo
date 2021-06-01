import APIError from '../../../shared-utilities/APIError.js'

export const checkTableArrays = (body) => {
    if (body.movieIds && !Array.isArray(body.movieIds)) {
        throw new APIError(`req.body.movieIds must be an array, got ${typeof body.movieIds}`, 400)
    }
    if (body.tvShowIds && !Array.isArray(body.tvShowIds)) {
        throw new APIError(`req.body.showIds must be an array, got ${typeof body.tvShowIds}`, 400)
    }
}

export const attachToProductionCompany = async (productionCompany, body, t = null) => {
    if (body.movieIds) {
        await productionCompany.movies().detach(productionCompany.related('movies').map(movie => movie.id), { transacting: t })
        await productionCompany.movies().attach(body.movieIds, { transacting: t })
    }
    if (body.tvShowIds) {
        await productionCompany.tvShows().detach(productionCompany.related('tvShows').map(show => show.id), { transacting: t })
        await productionCompany.tvShows().attach(body.tvShowIds, { transacting: t })
    }
}

export const detachAll = async (productionCompany, t = null) => {
    await productionCompany.movies().detach(productionCompany.related('movies').map(movie => movie.id), { transacting: t })
    await productionCompany.tvShows().detach(productionCompany.related('tvShows').map(show => show.id), { transacting: t })
}