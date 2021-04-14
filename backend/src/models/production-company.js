import BaseModel from './base-model.js'
import Country from './country.js'

export default class ProductionCompany extends BaseModel {
    get tableName () {
        return 'production_companies'
    }

    country () {
        return this.belongsTo(Country, 'countryId', 'id')
    }
}