import BaseModel from './base-model.js'
import Movie from './movie.js'
import TvShow from './tv-show.js'

export default class Director extends BaseModel {
    get tableName () {
        return 'directors'
    }

    movies () {
        return this.belongsToMany(Movie, 'movies_directors', 'directorId', 'movieId')
    }

    tvShows () {
        return this.belongsToMany(TvShow, 'tv_shows_directors', 'directorId', 'tvShowId')
    }
}