import BaseModel from './base-model.js'
import Movie from './movie.js'
import TvShow from './tv-show.js'

export default class Actor extends BaseModel {
    get tableName () {
        return 'actors'
    }

    movies () {
        return this.belongsToMany(Movie, 'movies_actors', 'actorId', 'movieId')
    }

    tvShows () {
        return this.belongsToMany(TvShow, 'tv_shows_actors', 'actorId', 'tvShowId')
    }
}