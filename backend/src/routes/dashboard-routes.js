import DashboardController from '../controllers/dashboard-controller.js'
import Router from '../util/router.js'
import catchErrors from '../middlewares/catchErrors.js'

const router = new Router()

router.get('/dashboard', catchErrors(DashboardController.getDashboard))


export default router