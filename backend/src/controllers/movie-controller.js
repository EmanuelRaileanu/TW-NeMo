import Movie from "../models/movie.js";
import APIError from "../../../shared-utilities/APIError.js";
import Bookshelf from "../bookshelf.js";

class MovieController {
    static relatedObject = {
        genres: q => {
            q.select('id', 'name')
        },
        productionCompanies: q => {
            q.select('id', 'name')
        },
        actors: q => {
            q.select('id', 'name')
        },
        directors: q => {
            q.select('id', 'name')
        },
        rating: q => {
            q.select('id', 'code')
        },
        languages: q => {
            q.select('id', 'code')
        }
    }

    static async getMovies(req, res) {
        const movies = await new Movie().query(q => {
            q.leftJoin('movies_genres', 'movies_genres.movieId', 'movies.id')
            q.leftJoin('movie_genres', 'movie_genres.id', 'movies_genres.genreId')
            q.leftJoin('movies_production_companies', 'movies_production_companies.movieId', 'movies.id')
            q.leftJoin('production_companies', 'production_companies.id', 'movies_production_companies.productionCompanyId')
            q.leftJoin('ratings', 'ratings.id', 'movies.ratingId')
            q.leftJoin('movies_languages', 'movies_languages.movieId', 'movies.id')
            q.leftJoin('languages', 'languages.id', 'movies_languages.languageId')
            if (req.query.filters && req.query.filters !== {}) {
                q.where(qb => {
                    if (req.query.filters.genres) {
                        qb.whereIn('movie_genres.name', req.query.filters.genres)
                    }
                    if (req.query.filters.productionCompanies) {
                        qb.whereIn('production_companies.name', req.query.filters.productionCompanies)
                    }
                    if (req.query.filters.rating) {
                        qb.whereIn('ratings.code', req.query.filters.rating)
                    }
                    if (req.query.filters.languages) {
                        qb.whereIn('languages.code', req.query.filters.languages)
                    }
                })
            }
            if (req.query.searchBy && req.query.searchBy !== {}) {
                q.where('movies.title', 'like', `%${req.query.searchBy}%`)
            }
            q.groupBy('movies.id')
        }).fetchPage({
            require: false,
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20
        })
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify({
            results: movies.toJSON({omitPivot: true}),
            pagination: movies.pagination
        }))
    }

    static async getMovieById(req, res) {
        const movie = await new Movie({id: req.params.movieId}).fetch({
            require: false,
            withRelated: [MovieController.relatedObject],
        })
        if (!movie) {
            throw new APIError('There is no movie with this id', 404)
        }
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify(movie.toJSON({omitPivot: true})))
    }

    static async updateMovie(req, res) {
        const movie = await new Movie({id: req.params.movieId}).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        if (!movie) {
            throw new APIError('There is no movie with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const movieColumns = await movie.getColumns()
        let updateBody = {}
        for (const column in req.body) {
            if (req.body.hasOwnProperty(column) && movieColumns.includes(column)) {
                updateBody[column] = req.body[column]
            }
        }
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        if (req.body.actorIds && !Array.isArray(req.body.actorIds)) {
            throw new APIError(`req.body.actorIds must be an array, got ${typeof req.body.actorIds}`, 400)
        }
        if (req.body.directorIds && !Array.isArray(req.body.directorIds)) {
            throw new APIError(`req.body.directorIds must be an array, got ${typeof req.body.directorIds}`, 400)
        }
        if (req.body.productionCompanyIds && !Array.isArray(req.body.productionCompanyIds)) {
            throw new APIError(`req.body.productionCompanyIds must be an array, got ${typeof req.body.productionCompanyIds}`, 400)
        }
        if (req.body.languageIds && !Array.isArray(req.body.languageIds)) {
            throw new APIError(`req.body.languageIds must be an array, got ${typeof req.body.languageIds}`, 400)
        }
        if (req.body.genreIds && !Array.isArray(req.body.genreIds)) {
            throw new APIError(`req.body.genreIds must be an array, got ${typeof req.body.genreIds}`, 400)
        }
        await Bookshelf.transaction(async t => {
            if (req.body.actorIds) {
                await movie.actors().detach(movie.related('actors').map(actor => actor.id), {transacting: t})
                await movie.actors().attach(req.body.actorIds, {transacting: t})
            }
            if (req.body.directorIds) {
                await movie.directors().detach(movie.related('directors').map(director => director.id), {transacting: t})
                await movie.directors().attach(req.body.directorIds, {transacting: t})
            }
            if (req.body.productionCompanyIds) {
                await movie.productionCompanies().detach(movie.related('productionCompanies').map(prodComp => prodComp.id), {transacting: t})
                await movie.productionCompanies().attach(req.body.productionCompanyIds, {transacting: t})
            }
            if (req.body.languageIds) {
                await movie.languages().detach(movie.related('languages').map(lang => lang.id), {transacting: t})
                await movie.languages().attach(req.body.languageIds, {transacting: t})
            }
            if (req.body.genreIds) {
                await movie.genres().detach(movie.related('genres').map(genre => genre.id), {transacting: t})
                await movie.genres().attach(req.body.genreIds, {transacting: t})
            }

        })
        const updatedMovie = await new Movie({id: req.params.movieId}).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify(updatedMovie.toJSON({omitPivot: true})))
    }

    static async deleteMovie(req, res) {
        const movie = await new Movie({id: req.params.movieId}).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        if (!movie) {
            throw new APIError('There is no movie with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await MovieController.detachAll(movie,t)
            await movie.destroy({transacting: t})
        })
        res.writeHead(200, {'Content-type': 'application/json'})
        return res.end(JSON.stringify({message: "Movie successfully deleted"}))
    }

    static async detachAll(movie,t=null){
        await movie.genres().detach(movie.related('genres').map(genre => genre.id), {transacting: t})
        await movie.actors().detach(movie.related('actors').map(actor => actor.id), {transacting: t})
        await movie.directors().detach(movie.related('directors').map(director => director.id), {transacting: t})
        await movie.productionCompanies().detach(movie.related('productionCompanies').map(prodComp => prodComp.id), {transacting: t})
        await movie.languages().detach(movie.related('languages').map(lang => lang.id), {transacting: t})
    }
}

export default MovieController