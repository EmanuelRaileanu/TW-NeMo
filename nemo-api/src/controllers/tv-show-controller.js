import APIError from "../../../shared-utilities/APIError.js";
import {attachToMovie, checkTableArrays, detachAll} from "../utils/movie-utils.js";
import Bookshelf from "../bookshelf.js";
import TvShow from "../models/tv-show.js";
import TvShowGenre from "../models/tv-show-genre.js";


class TvShowController{
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
        languages: q => {
            q.select('id', 'code')
        }
    }
    static columnsToOrderBy = ['title', 'voteAverage', 'numberOfVotes', 'tmdbNumberOfVotes', 'tmdbVoteAverage']
    static minimalColumns = ['title', 'description', 'tagline', 'status', 'releaseDate', 'actorIds', 'directorIds', 'languageIds', 'productionCompanyIds', 'genreIds']

    static async getTvShows (req, res) {
        const shows = await new TvShow().query(q => {
            q.leftJoin('tv_shows_genres', 'tv_shows_genres.tvShowId', 'tv_shows.id')
            q.leftJoin('tv_show_genres', 'tv_show_genres.id', 'tv_shows_genres.genreId')
            q.leftJoin('tv_shows_production_companies', 'tv_shows_production_companies.tvShowId', 'tv_shows.id')
            q.leftJoin('production_companies', 'production_companies.id', 'tv_shows_production_companies.productionCompanyId')
            q.leftJoin('tv_shows_languages', 'tv_shows_languages.tvShowId', 'tv_shows.id')
            q.leftJoin('languages', 'languages.id', 'tv_shows_languages.languageId')
            if (req.query.filters && req.query.filters !== {}) {
                q.where(qb => {
                    if (req.query.filters.genres) {
                        qb.whereIn('tv_show_genres.name', req.query.filters.genres)
                    }
                    if (req.query.filters.productionCompanies) {
                        qb.whereIn('production_companies.name', req.query.filters.productionCompanies)
                    }
                    if (req.query.filters.languages) {
                        qb.whereIn('languages.code', req.query.filters.languages)
                    }
                })
            }
            if (req.query.searchBy && req.query.searchBy !== {}) {
                q.where('tv_shows.title', 'like', `%${req.query.searchBy}%`)
            }
            q.groupBy('tv_shows.id')

            if (req.query.orderBy && req.query.orderBy !== {}) {
                if (!TvShowController.columnsToOrderBy.includes(req.query.orderBy.column[0])) {
                    throw new APIError('I cannot sort by this column', 400)
                }
                if (!req.query.orderBy.direction || !['ASC', 'DESC'].includes(req.query.orderBy.direction[0])) {
                    req.query.orderBy.direction = ['ASC']
                }
                q.orderBy(`tv_shows.${req.query.orderBy.column}`, req.query.orderBy.direction[0])
            } else {
                q.orderBy('tv_shows.voteAverage', 'DESC')
                q.orderBy('tv_shows.tmdbVoteAverage', 'DESC')
            }
        }).fetchPage({
            require: false,
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify({
            results: shows.toJSON({ omitPivot: true }),
            pagination: shows.pagination
        }))
    }

    static async getTvShowById (req, res) {
        const show = await new TvShow({ id: req.params.showId }).fetch({
            require: false,
            withRelated: [TvShowController.relatedObject]
        })
        if (!show) {
            throw new APIError('There is no show with this id', 404)
        }
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(show.toJSON({ omitPivot: true })))
    }

    static async getGenres (req, res) {
        const genres = await new TvShowGenre().query(q => {
            q.orderBy('tv_show_genres.name', 'ASC')
        }).fetchAll({
            require: false,
            columns: ['id', 'name']
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(genres.toJSON({ omitPivot: true })))
    }

    static async updateShow (req, res) {
        const show = await new TvShow({ id: req.params.showId }).fetch({
            require: false,
            withRelated: [TvShowController.relatedObject]
        })
        if (!show) {
            throw new APIError('There is no show with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const updateBody = await show.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        console.log(req.body)
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            await show.save(updateBody, { method: 'update', patch: 'true', transacting: t })
            await attachToMovie(show, req.body, t)
        })
        const updatedShow = await new TvShow({ id: req.params.showId }).fetch({
            require: false,
            withRelated: [TvShowController.relatedObject]
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(updatedShow.toJSON({ omitPivot: true })))
    }

    static async addShow (req, res) {
        let show = await new TvShow().query(q => {
            q.where('tv_shows.title', 'like', `${req.body.title}`)
        }).fetch({ require: false })
        if (show) {
            throw new APIError('There is already a movie with this name', 409)
        }
        show = new TvShow()
        const columns = Object.keys(req.body)
        if (!TvShowController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${TvShowController.minimalColumns}`, 400)
        }
        const addBody = await show.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            show = await new TvShow(addBody).save(null, { method: 'insert', transacting: t })
            await attachToMovie(show, req.body, t)
        })
        show = await show.fetch({ require: false, withRelated: [TvShowController.relatedObject] })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify(show.toJSON({ omitPivot: true })))
    }

    static async deleteShow (req, res) {
        const show = await new TvShow({ id: req.params.showId }).fetch({
            require: false,
            withRelated: [TvShowController.relatedObject]
        })
        if (!show) {
            throw new APIError('There is no show with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await detachAll(show, t)
            await show.destroy({ transacting: t })
        })
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify({ message: "TV show successfully deleted" }))
    }


}

export default  TvShowController