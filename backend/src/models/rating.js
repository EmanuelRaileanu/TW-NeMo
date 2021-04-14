import BaseModel from './base-model.js'
import Movie from './movie.js'

export default class Rating extends BaseModel {
    get tableName () {
        return 'ratings'
    }

    movies () {
        return this.hasMany(Movie, 'ratingId', 'id')
    }
}