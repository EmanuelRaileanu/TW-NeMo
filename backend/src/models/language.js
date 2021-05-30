import BaseModel from './base-model.js'
import Movie from './movie.js'
import TvShow from './tv-show.js'

export default class Language extends BaseModel {
    get tableName () {
        return 'languages'
    }

    movies () {
        return this.belongsToMany(Movie, 'movies_languages', 'languageId', 'movieId')
    }

    tvShows () {
        return this.belongsToMany(TvShow, 'tv_shows_languages', 'languageId', 'tvShowId')
    }
}