import BaseModel from './base-model.js'
import TvEpisode from './tv-episode.js'
import TvShow from './tv-show.js'

export default class TvSeason extends BaseModel {
    get tableName () {
        return 'tv_seasons'
    }

    show () {
        return this.belongsTo(TvShow, 'tvShowId', 'id')
    }

    episodes () {
        return this.hasMany(TvEpisode, 'seasonId', 'id')
    }
}