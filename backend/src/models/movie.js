import BaseModel from './base-model.js'
import Rating from './rating.js'
import MovieGenre from './movie-genre.js'
import Actor from './actor.js'
import Director from './director.js'

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

    actors () {
        return this.belongsToMany(Actor, 'movies_actors', 'movieId', 'actorId')
    }

    directors () {
        return this.belongsToMany(Director, 'movies_directors', 'movieId', 'directorId')
    }
}