import ProductionCompanyController from '../controllers/production-company-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/', cors(catchErrors(ProductionCompanyController.getProductionCompanies)))
router.get('/:productionCompanyId', cors(catchErrors(ProductionCompanyController.getProductionCompanyById)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(ProductionCompanyController.addProductionCompany))))
router.put('/:productionCompanyId', cors(catchErrors(validateToken(ProductionCompanyController.updateProductionCompany))))
router.delete('/:productionCompanyId', cors(catchErrors(validateToken(ProductionCompanyController.deleteProductionCompany))))

export default router