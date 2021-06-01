import BaseModel from './base-model.js'
import Actor from './actor.js'
import Director from './director.js'
import TvSeason from './tv-season.js'

export default class TvEpisode extends BaseModel {
    get tableName () {
        return 'tv_episodes'
    }

    actors () {
        return this.belongsToMany(Actor, 'tv_episodes_actors', 'tvEpisodeId', 'actorId')
    }

    directors () {
        return this.belongsToMany(Director, 'tv_episodes_directors', 'tvEpisodeId', 'directorId')
    }

    season () {
        return this.belongsTo(TvSeason, 'seasonId', 'id')
    }
}