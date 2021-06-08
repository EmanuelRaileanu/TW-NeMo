import BaseModel from './base-model.js'
import Movie from './movie.js'
import TvShow from './tv-show.js'

export default class Rating extends BaseModel {
    get tableName () {
        return 'ratings'
    }

    movies () {
        return this.hasMany(Movie, 'ratingId', 'id')
    }

    tvShows () {
        return this.hasMany(TvShow, 'ratingId', 'id')
    }
}