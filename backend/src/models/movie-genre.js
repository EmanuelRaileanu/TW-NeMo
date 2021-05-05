import BaseModel from './base-model.js'
import Movie from './movie.js'

export default class MovieGenre extends BaseModel {
    get tableName () {
        return 'movie_genres'
    }

    movies () {
        return this.belongsToMany(Movie, 'movies_genres', 'genreId', 'movieId')
    }
}