import ProductionCompanyController from '../controllers/production-company-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/', cors(catchErrors(ProductionCompanyController.getProductionCompanies)))
router.get('/:productionCompanyId', cors(catchErrors(ProductionCompanyController.getProductionCompanyById)))
router.get('/countries/:countryId', cors(catchErrors(ProductionCompanyController.getCountryById)))
router.get('/countries', cors(catchErrors(ProductionCompanyController.getCountries)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(ProductionCompanyController.addProductionCompany))))
router.put('/:productionCompanyId', cors(catchErrors(validateToken(ProductionCompanyController.updateProductionCompany))))
router.delete('/:productionCompanyId', cors(catchErrors(validateToken(ProductionCompanyController.deleteProductionCompany))))

export default router