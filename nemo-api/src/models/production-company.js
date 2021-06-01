import BaseModel from './base-model.js'
import Country from './country.js'
import Movie from './movie.js'
import TvShow from './tv-show.js'

export default class ProductionCompany extends BaseModel {
    get tableName () {
        return 'production_companies'
    }

    country () {
        return this.belongsTo(Country, 'countryId', 'id')
    }

    movies () {
        return this.belongsToMany(Movie, 'movies_production_companies', 'productionCompanyId', 'movieId')
    }

    tvShows () {
        return this.belongsToMany(TvShow, 'tv_shows_production_companies', 'productionCompanyId', 'tvShowId')
    }
}