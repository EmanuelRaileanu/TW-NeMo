import Movie from '../models/movie.js'
import APIError from '../../../shared-utilities/APIError.js'
import Bookshelf from '../bookshelf.js'
import { attachToMovie, checkTableArrays, detachAll, validateReviewBody } from '../utils/movie-utils.js'
import MovieGenre from '../models/movie-genre.js'
import MovieReview from '../models/movie-review.js'
import Language from "../models/language.js";
import Rating from '../models/rating.js'
import ObjectsToCsv from 'objects-to-csv'
import { CORS_HEADERS } from '../middlewares/cors.js'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import sharp from 'sharp'

class MovieController {
    static relatedObject = {
        genres: q => {
            q.select('id', 'name')
        },
        productionCompanies: q => {
            q.select('id', 'name', 'logoPath')
        },
        actors: q => {
            q.select('id', 'name', 'profilePhotoPath')
        },
        directors: q => {
            q.select('id', 'name', 'profilePhotoPath')
        },
        rating: q => {
            q.select('id', 'code')
        },
        languages: q => {
            q.select('id', 'code')
        },
        reviews: q => {
            q.select('id', 'score', 'text', 'createdAt')
            q.orderBy('createdAt', 'DESC')
            q.limit(10)
        }
    }
    static columnsToOrderBy = ['title', 'voteAverage', 'numberOfVotes', 'tmdbNumberOfVotes', 'tmdbVoteAverage']
    static minimalColumns = ['title', 'description', 'tagline', 'ratingId', 'status', 'releaseDate', 'actorIds', 'directorIds', 'languageIds', 'productionCompanyIds', 'genreIds']

    static async getMovies (req, res) {
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

            if (req.query.orderBy && req.query.orderBy !== {}) {
                if (!MovieController.columnsToOrderBy.includes(req.query.orderBy.column[0])) {
                    throw new APIError('I cannot sort by this column', 400)
                }
                if (!req.query.orderBy.direction || !['ASC', 'DESC'].includes(req.query.orderBy.direction[0])) {
                    req.query.orderBy.direction = ['ASC']
                }
                q.orderBy(`movies.${req.query.orderBy.column}`, req.query.orderBy.direction[0])
            } else {
                q.orderBy('movies.voteAverage', 'DESC')
                q.orderBy('movies.tmdbNumberOfVotes', 'DESC')
            }
        }).fetchPage({
            require: false,
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20
        })
        return res.end(JSON.stringify({
            results: movies.toJSON({ omitPivot: true }),
            pagination: movies.pagination
        }))
    }

    static async getMovieById (req, res) {
        const movie = await new Movie({ id: req.params.movieId }).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        if (!movie) {
            throw new APIError('There is no movie with this id', 404)
        }
        return res.end(JSON.stringify(movie.toJSON({ omitPivot: true })))
    }

    static async getGenres (req, res) {
        const genres = await new MovieGenre().query(q => {
            q.orderBy('movie_genres.name', 'ASC')
        }).fetchAll({
            require: false,
            columns: ['id', 'name']
        })
        return res.end(JSON.stringify(genres.toJSON({ omitPivot: true })))
    }

    static async getLanguages (req, res) {
        const languages = await new Language().query(q => {
            q.orderBy('languages.code', 'ASC')
        }).fetchAll({
            require: false,
            columns: ['id', 'code']
        })
        return res.end(JSON.stringify(languages.toJSON()))
    }

    static async getRatings (req, res) {
        const ratings = await new Rating().query(q => {
            q.orderBy('code', 'ASC')
        }).fetchAll({
            require: false,
            columns: ['id', 'code']
        })
        return res.end(JSON.stringify(ratings.toJSON()))
    }

    static async exportMovies (req, res) {
        if (['svg', 'webp'].includes(req.query.format)) {
            if (req.query.criterion === 'rating') {
                const movies = await new Movie().query(q => {
                    q.select(Bookshelf.knex.raw('ratings.code AS rating, COUNT(*) AS count'))
                    q.innerJoin('ratings', 'ratings.id', 'movies.ratingId')
                    q.groupBy('ratings.code')
                }).fetchAll({ require: false })
                const chart = new ChartJSNodeCanvas({ type: req.query.format, width: 800, height: 600 })
                const ratings = movies.map(movie => movie.get('rating'))
                const data = movies.map(movie => movie.get('count'))
                const image = chart.renderToBufferSync({
                    type: 'bar',
                    data: {
                        labels: ratings,
                        datasets: [{
                            label: 'Number of movies',
                            data,
                            backgroundColor: movies.map(movie => `rgba(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, 1)`),
                            borderWidth: 1
                        }]
                    }
                })
                res.writeHead(200, {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename=nemo_movies.${req.query.format}`
                })
                if (req.query.format === 'webp') {
                    return res.end(await sharp(image).webp().toBuffer())
                } else {
                    return res.end(image.toString())
                }
            } else {
                const movies = await new Movie().query(q => {
                    q.select(Bookshelf.knex.raw('movie_genres.name AS genre, COUNT(*) AS count'))
                    q.join('movies_genres', 'movies_genres.movieId', 'movies.id')
                    q.join('movie_genres', 'movie_genres.id', 'movies_genres.genreId')
                    q.groupBy('movie_genres.name')
                }).fetchAll({ require: false })
                const chart = new ChartJSNodeCanvas({ type: 'svg', width: 800, height: 600 })
                const ratings = movies.map(movie => movie.get('genre'))
                const data = movies.map(movie => movie.get('count'))
                const image = chart.renderToBufferSync({
                    type: 'bar',
                    data: {
                        labels: ratings,
                        datasets: [{
                            label: 'Number of movies',
                            data,
                            backgroundColor: movies.map(movie => `rgba(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, 1)`),
                            borderWidth: 1
                        }]
                    }
                })
                res.writeHead(200, {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename=nemo_movies.${req.query.format}`
                })
                if (req.query.format === 'webp') {
                    return res.end(await sharp(image).webp().toBuffer())
                } else {
                    return res.end(image.toString())
                }
            }
        } else {
            const movies = await new Movie().fetchAll({ require: false, withRelated: [MovieController.relatedObject] })
            const parsedMovies = await Promise.all(movies.toJSON().map(async movie => {
                movie.genres = movie.genres.map(genre => genre.name).join(',')
                movie.productionCompanies = movie.productionCompanies.map(productionCompany => productionCompany.name).join(',')
                movie.actors = movie.actors.map(actor => actor.name).join(',')
                movie.directors = movie.directors.map(director => director.name).join(',')
                movie.rating = movie.rating && movie.rating.code
                movie.languages = movie.languages.map(language => language.code).join(',')
                delete movie.ratingId
                delete movie.createdAt
                delete movie.updatedAt
                delete movie.reviews
                return movie
            }))
            res.writeHead(200, {
                ...CORS_HEADERS,
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename=nemo_movies.csv'
            })
            return res.end(await new ObjectsToCsv(parsedMovies).toString())
        }
    }

    static async updateMovie (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const movie = await new Movie({ id: req.params.movieId }).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        if (!movie) {
            throw new APIError('There is no movie with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const updateBody = await movie.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            await movie.save(updateBody, { method: 'update', patch: 'true', transacting: t })
            await attachToMovie(movie, req.body, t)
        })
        const updatedMovie = await new Movie({ id: req.params.movieId }).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        return res.end(JSON.stringify(updatedMovie.toJSON({ omitPivot: true })))
    }

    static async addMovie (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        let movie = await new Movie().query(q => {
            q.where('movies.title', 'like', `${req.body.title}`)
        }).fetch({ require: false })
        if (movie) {
            throw new APIError('There is already a movie with this name', 409)
        }
        movie = new Movie()
        const columns = Object.keys(req.body)
        if (!MovieController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${MovieController.minimalColumns}`, 400)
        }
        const addBody = await movie.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            movie = await new Movie(addBody).save(null, { method: 'insert', transacting: t })
            await attachToMovie(movie, req.body, t)
        })
        movie = await movie.fetch({ require: false, withRelated: [MovieController.relatedObject] })
        return res.end(JSON.stringify(movie.toJSON({ omitPivot: true })))
    }

    static async deleteMovie (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const movie = await new Movie({ id: req.params.movieId }).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        if (!movie) {
            throw new APIError('There is no movie with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await detachAll(movie, t)
            await movie.destroy({ transacting: t })
        })
        return res.end(JSON.stringify({ message: "Movie successfully deleted" }))
    }

    static async getFavorites (req, res) {
        const movies = await new Movie().query(q => {
            q.innerJoin('favorite_movies', 'favorite_movies.movieId', 'movies.id')
            q.where('favorite_movies.userId', req.user.id)
        }).fetchAll({ require: false, withRelated: [MovieController.relatedObject] })
        return res.end(JSON.stringify(movies.toJSON({ omitPivot: true })))
    }

    static async addFavorite (req, res) {
        const movie = await new Movie({ id: req.params.movieId }).fetch({ require: false })
        if (!movie) {
            throw new APIError(`There is no movie with the id ${req.params.movieId}`, 404)
        }
        await Bookshelf.knex.raw('INSERT INTO favorite_movies values (:userId, :movieId)', {
            userId: req.user.id,
            movieId: movie.id
        })
        return res.end(JSON.stringify({ message: 'Added movie to favorites' }))
    }

    static async deleteFavorite (req, res) {
        const movie = await new Movie({ id: req.params.movieId }).fetch({ require: false })
        if (!movie) {
            throw new APIError(`There is no movie with the id ${req.params.movieId}`, 404)
        }
        await Bookshelf.knex.raw('DELETE FROM favorite_movies WHERE movieId = :movieId AND userId = :userId', {
            userId: req.user.id,
            movieId: movie.id
        })
        return res.end(JSON.stringify({ message: 'Removed movie from favorites' }))
    }

    static async addReview (req, res) {
        const movie = await new Movie({ id: req.params.movieId }).fetch({
            require: false,
            withRelated: [MovieController.relatedObject]
        })
        if (!movie) {
            throw new APIError(`There is no movie with the id ${req.params.id}`, 404)
        }
        if (!req.body.score) {
            throw new APIError('score is required', 400)
        }
        validateReviewBody(req.body)
        let addedReview
        await Bookshelf.transaction(async t => {
            const numberOfVotes = movie.related('reviews').toJSON().length + 1
            const voteAverage = (movie.related('reviews').toJSON().map(review => review.score).reduce((a, b) => a + b, 0) + req.body.score) / numberOfVotes
            await movie.save({ numberOfVotes, voteAverage }, { method: 'update', patch: true, transacting: t })
            addedReview = await new MovieReview({
                userId: req.user.id,
                movieId: movie.id,
                score: req.body.score,
                text: req.body.text || null
            }).save(null, { method: 'insert', transacting: t })
        })
        return res.end(JSON.stringify(addedReview.toJSON()))
    }

    static async updateReview (req, res) {
        const movie = await new Movie({ id: req.params.movieId }).fetch({ require: false })
        if (!movie) {
            throw new APIError(`There is no movie with the id ${req.params.id}`, 404)
        }
        const review = await new MovieReview({ userId: req.user.id, movieId: movie.id }).fetch({ require: false })
        if (!review) {
            throw new APIError('There is not review added to this movie by the logged in user', 404)
        }
        validateReviewBody(req.body)
        const updateBody = await review.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        await review.save(updateBody, { method: 'update', patch: true })
        return res.end(JSON.stringify(review.toJSON()))
    }

    static async deleteReview (req, res) {
        const movie = await new Movie({ id: req.params.movieId }).fetch({ require: false })
        if (!movie) {
            throw new APIError(`There is no movie with the id ${req.params.id}`, 404)
        }
        const review = await new MovieReview({ userId: req.user.id, movieId: movie.id }).fetch({ require: false })
        if (!review) {
            throw new APIError('There is not review added to this movie by the logged in user', 404)
        }
        await review.destroy()
        return res.end(JSON.stringify({ message: "Review successfully deleted" }))
    }
}

export default MovieController