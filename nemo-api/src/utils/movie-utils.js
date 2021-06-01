import APIError from "../../../shared-utilities/APIError.js";

export const checkTableArrays = (body) => {
    if (body.actorIds && !Array.isArray(body.actorIds)) {
        throw new APIError(`req.body.actorIds must be an array, got ${typeof body.actorIds}`, 400)
    }
    if (body.directorIds && !Array.isArray(body.directorIds)) {
        throw new APIError(`req.body.directorIds must be an array, got ${typeof body.directorIds}`, 400)
    }
    if (body.productionCompanyIds && !Array.isArray(body.productionCompanyIds)) {
        throw new APIError(`req.body.productionCompanyIds must be an array, got ${typeof body.productionCompanyIds}`, 400)
    }
    if (body.languageIds && !Array.isArray(body.languageIds)) {
        throw new APIError(`req.body.languageIds must be an array, got ${typeof body.languageIds}`, 400)
    }
    if (body.genreIds && !Array.isArray(body.genreIds)) {
        throw new APIError(`req.body.genreIds must be an array, got ${typeof body.genreIds}`, 400)
    }
}

export const attachToMovie = async (movie, body,t=null) => {
    if (body.actorIds) {
        await movie.actors().detach(movie.related('actors').map(actor => actor.id), {transacting: t})
        await movie.actors().attach(body.actorIds, {transacting: t})
    }
    if (body.directorIds) {
        await movie.directors().detach(movie.related('directors').map(director => director.id), {transacting: t})
        await movie.directors().attach(body.directorIds, {transacting: t})
    }
    if (body.productionCompanyIds) {
        await movie.productionCompanies().detach(movie.related('productionCompanies').map(prodComp => prodComp.id), {transacting: t})
        await movie.productionCompanies().attach(body.productionCompanyIds, {transacting: t})
    }
    if (body.languageIds) {
        await movie.languages().detach(movie.related('languages').map(lang => lang.id), {transacting: t})
        await movie.languages().attach(body.languageIds, {transacting: t})
    }
    if (body.genreIds) {
        await movie.genres().detach(movie.related('genres').map(genre => genre.id), {transacting: t})
        await movie.genres().attach(body.genreIds, {transacting: t})
    }
}

export const detachAll = async (movie, t = null) => {
    await movie.genres().detach(movie.related('genres').map(genre => genre.id), {transacting: t})
    await movie.actors().detach(movie.related('actors').map(actor => actor.id), {transacting: t})
    await movie.directors().detach(movie.related('directors').map(director => director.id), {transacting: t})
    await movie.productionCompanies().detach(movie.related('productionCompanies').map(prodComp => prodComp.id), {transacting: t})
    await movie.languages().detach(movie.related('languages').map(lang => lang.id), {transacting: t})
}