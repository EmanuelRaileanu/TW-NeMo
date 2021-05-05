import BaseModel from './base-model.js'
import Rating from './rating.js'
import MovieGenre from './movie-genre.js'

export default class Movie extends BaseModel {
    get tableName () {
        return 'movies'
    }

    rating () {
        return this.belongsTo(Rating, 'ratingId', 'id')
    }

    genres () {
        return this.belongsToMany(MovieGenre, 'movies_genres', 'movieId', 'genreId')
    }
}