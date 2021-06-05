import BaseModel from './base-model.js'
import TvShowGenre from './tv-show-genre.js'
import Actor from './actor.js'
import Director from './director.js'
import ProductionCompany from './production-company.js'
import Language from './language.js'
import TvSeason from './tv-season.js'
import TvShowReview from './tv-show-review.js'

export default class TvShow extends BaseModel {
    get tableName () {
        return 'tv_shows'
    }

    genres () {
        return this.belongsToMany(TvShowGenre, 'tv_shows_genres', 'tvShowId', 'genreId')
    }

    actors () {
        return this.belongsToMany(Actor, 'tv_shows_actors', 'tvShowId', 'actorId')
    }

    directors () {
        return this.belongsToMany(Director, 'tv_shows_directors', 'tvShowId', 'directorId')
    }

    languages () {
        return this.belongsToMany(Language, 'tv_shows_languages', 'tvShowId', 'languageId')
    }

    productionCompanies () {
        return this.belongsToMany(ProductionCompany, 'tv_shows_production_companies', 'tvShowId', 'productionCompanyId')
    }

    seasons () {
        return this.hasMany(TvSeason, 'tvShowId', 'id')
    }

    reviews () {
        return this.hasMany(TvShowReview, 'tvShowId', 'id')
    }
}