import ProductionCompanyController from '../controllers/production-company-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/', cors(catchErrors(ProductionCompanyController.getProductionCompanies)))
router.get('/:productionCompanyId', cors(catchErrors(ProductionCompanyController.getProductionCompanyById)))
router.post('/', cors(catchErrors(ProductionCompanyController.addProductionCompany)))
router.put('/:productionCompanyId', cors(catchErrors(ProductionCompanyController.updateProductionCompany)))
router.delete('/:productionCompanyId', cors(catchErrors(ProductionCompanyController.deleteProductionCompany)))

export default router