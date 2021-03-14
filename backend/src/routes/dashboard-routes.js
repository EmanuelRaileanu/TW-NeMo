import DashboardController from "../controllers/dashboard-controller.js";
import Router from "../router.js";

const router = new Router()

router.get('/dashboard', DashboardController.getDashboard)


export default router