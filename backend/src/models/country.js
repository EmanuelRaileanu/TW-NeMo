import BaseModel from './base-model.js'
import ProductionCompany from './production-company.js'

export default class Country extends BaseModel {
    get tableName () {
        return 'countries'
    }

    productionCompanies () {
        return this.hasMany(ProductionCompany, 'countryId', 'id')
    }
}