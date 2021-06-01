import ProductionCompanyController from '../controllers/production-company-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'

const router = new Router()

router.get('/', catchErrors(ProductionCompanyController.getProductionCompanies))
router.get('/:productionCompanyId', catchErrors(ProductionCompanyController.getProductionCompanyById))
router.post('/', catchErrors(ProductionCompanyController.addProductionCompany))
router.put('/:productionCompanyId', catchErrors(ProductionCompanyController.updateProductionCompany))
router.delete('/:productionCompanyId', catchErrors(ProductionCompanyController.deleteProductionCompany))
export default router