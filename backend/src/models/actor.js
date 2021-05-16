import BaseModel from './base-model.js'

export default class Actor extends BaseModel {
    get tableName () {
        return 'actors'
    }

    movies () {
        return this.belongsToMany(Movie, 'movies_actors', 'actorId', 'movieId')
    }
}