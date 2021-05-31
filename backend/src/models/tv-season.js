import BaseModel from './base-model.js'
import TvEpisode from './tv-episode.js'

export default class TvSeason extends BaseModel {
    get tableName () {
        return 'tv_seasons'
    }

    episodes () {
        return this.hasMany(TvEpisode, 'seasonId', 'id')
    }
}