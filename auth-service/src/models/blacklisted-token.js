import BaseModel from './base-model.js'

export default class BlacklistedToken extends BaseModel {
    get tableName () {
        return 'token_blacklist'
    }
}
