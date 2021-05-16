import BaseModel from './base-model.js'
import Movie from './movie.js'

export default class Director extends BaseModel {
    get tableName () {
        return 'directors'
    }

    movies () {
        return this.belongsToMany(Movie, 'movies_directors', 'directorId', 'movieId')
    }
}