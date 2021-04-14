import BaseModel from './base-model.js'

export default class Language extends BaseModel {
    get tableName () {
        return 'languages'
    }
}