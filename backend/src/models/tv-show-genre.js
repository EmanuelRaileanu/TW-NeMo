import BaseModel from './base-model.js'

export default class TvShowGenre extends BaseModel {
    get tableName () {
        return 'tv_show_genres'
    }
}