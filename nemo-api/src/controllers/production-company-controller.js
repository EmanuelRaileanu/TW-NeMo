import ProductionCompany from '../models/production-company.js'
import APIError from '../../../shared-utilities/APIError.js'
import Bookshelf from '../bookshelf.js'
import { attachToProductionCompany, checkTableArrays, detachAll } from '../utils/production-company-utils.js'
import Country from "../models/country.js";

class ProductionCompanyController {
    static relatedObject = {
        country: q => {
            q.select('id', 'code')
        },
        movies: q => {
            q.select('id', 'title')
        },
        tvShows: q => {
            q.select('id', 'title')
        }
    }
    static minimalColumns = ['name', 'headquarters', 'countryId']

    static async getProductionCompanies (req, res) {
        const companies = await new ProductionCompany().query(q => {
            if (req.query.searchBy && req.query.searchBy !== {}) {
                q.where('production_companies.name', 'like', `%${req.query.searchBy}%`)
            }
            q.orderBy('production_companies.name', 'ASC')

        }).fetchPage({
            require: false,
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20
        })
        return res.end(JSON.stringify({
            results: companies.toJSON({ omitPivot: true }),
            pagination: companies.pagination
        }))
    }

    static async getCountries (req, res) {
        const country = await new Country().query(q => {
            if (req.query.searchBy && req.query.searchBy !== {}) {
                q.where('countries.code', 'like', `%${req.query.searchBy}%`)
            }
        }).fetch({ require: false })
        return res.end(JSON.stringify({
            results: country.toJSON({ omitPivot: true })
        }))
    }

    static async getCountryById(req,res){
        const country= await new Country({ id: req.params.countryId }).fetch({require:false})
        if(!country){
            throw new APIError('There is no country with this id')
        }
        return res.end(JSON.stringify({
            results: country.toJSON({omniPivot: true})
        }))
    }

    static async getProductionCompanyById (req, res) {
        const company = await new ProductionCompany({ id: req.params.productionCompanyId }).fetch({
            require: false,
            withRelated: [ProductionCompanyController.relatedObject]
        })
        if (!company) {
            throw new APIError('There is no production company with this id', 404)
        }
        return res.end(JSON.stringify(company.toJSON({ omitPivot: true })))
    }

    static async updateProductionCompany (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const company = await new ProductionCompany({ id: req.params.productionCompanyId }).fetch({
            require: false,
            withRelated: [ProductionCompanyController.relatedObject]
        })
        if (!company) {
            throw new APIError('There is no production company with this id', 404)
        }
        if (!req.body) {
            throw new APIError('Missing request body', 400)
        }
        const updateBody = await company.createBodyAccordingToModel(req.body)
        if (updateBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            await company.save(updateBody, { method: 'update', patch: 'true', transacting: t })
            await attachToProductionCompany(company, req.body, t)
        })
        const updatedCompany = await new ProductionCompany({ id: req.params.productionCompanyId }).fetch({
            require: false,
            withRelated: [ProductionCompanyController.relatedObject]
        })
        return res.end(JSON.stringify(updatedCompany.toJSON({ omitPivot: true })))
    }

    static async addProductionCompany (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        let company = await new ProductionCompany().query(q => {
            q.where('production_companies.name', 'like', `${req.body.title}`)
        }).fetch({ require: false })
        if (company) {
            throw new APIError('There is already a production company with this name', 409)
        }
        company = new ProductionCompany()
        const columns = Object.keys(req.body)
        if (!ProductionCompanyController.minimalColumns.every(v => columns.includes(v))) {
            throw new APIError(`The primary fields are not filled, please send a request with the following fields: ${ProductionCompanyController.minimalColumns}`, 400)
        }
        const addBody = await company.createBodyAccordingToModel(req.body)
        if (addBody === {}) {
            throw new APIError('No columns were updated', 400)
        }
        checkTableArrays(req.body)
        await Bookshelf.transaction(async t => {
            company = await new ProductionCompany(addBody).save(null, { method: 'insert', transacting: t })
            await attachToProductionCompany(company, req.body, t)
        })
        company = await company.fetch({ require: false, withRelated: [ProductionCompanyController.relatedObject] })
        return res.end(JSON.stringify(company.toJSON({ omitPivot: true })))
    }

    static async deleteProductionCompany (req, res) {
        if (!['Admin', 'Owner'].includes(req.user.role.name)) {
            throw new APIError('This operation is forbidden', 403)
        }
        const company = await new ProductionCompany({ id: req.params.productionCompanyId }).fetch({
            require: false,
            withRelated: [ProductionCompanyController.relatedObject]
        })
        if (!company) {
            throw new APIError('There is no production company with this id', 404)
        }
        await Bookshelf.transaction(async t => {
            await detachAll(company, t)
            await company.destroy({ transacting: t })
        })
        return res.end(JSON.stringify({ message: "Production company successfully deleted" }))
    }
}

export default ProductionCompanyController