import BaseModel from './base-model.js'
import TvShow from './tv-show.js'

export default class TvShowGenre extends BaseModel {
    get tableName () {
        return 'tv_show_genres'
    }

    tvShows () {
        return this.belongsToMany(TvShow, 'tv_shows_genres', 'genreId', 'tvShowId')
    }
}