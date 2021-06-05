import BaseModel from './base-model.js'
import Movie from './movie.js'

export default class MovieReview extends BaseModel {
    get tableName () {
        return 'user_movie_reviews'
    }

    movie () {
        return this.belongsTo(Movie, 'movieId', 'id')
    }
}