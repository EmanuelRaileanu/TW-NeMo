import BaseModel from './base-model.js'
import TvShow from './tv-show.js'

export default class TvShowReview extends BaseModel {
    get tableName () {
        return 'user_tv_show_reviews'
    }

    tvShow () {
        return this.belongsTo(TvShow, 'tvShowId', 'id')
    }
}