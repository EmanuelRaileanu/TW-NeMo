import BaseModel from './base-model.js'
import TvShowGenre from './tv-show-genre.js'
import Actor from './actor.js'
import Director from './director.js'

export default class TvSeason extends BaseModel {
    get tableName () {
        return 'tv_seasons'
    }

    genres () {
        return this.belongsToMany(TvShowGenre, 'tv_shows_genres', 'tvShowId', 'genreId')
    }

    actors () {
        return this.belongsToMany(Actor, 'movies_actors', 'tvShowId', 'actorId')
    }

    directors () {
        return this.belongsToMany(Director, 'movies_directors', 'tvShowId', 'directorId')
    }
}