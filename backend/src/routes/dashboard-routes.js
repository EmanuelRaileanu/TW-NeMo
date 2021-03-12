import DashboardController from "../controllers/dashboard-controller.js";

const dashboardRoutes = async (req, res) => {
    switch (req.method) {
        case 'GET':
            await DashboardController.getDashboard(req, res)
            break
    }
}

export default dashboardRoutes