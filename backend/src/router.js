import dashboardRoutes from "./routes/dashboard-routes.js";
import movieRoutes from "./routes/movie-routes.js";

const router = async (req, res) => {
    switch (req.url.match(/\/[^\/ \n]+/)[0]) {
        case '/dashboard':
            await dashboardRoutes(req, res)
            break
        case '/movies':
            await movieRoutes(req, res)
            break
        default:
            res.end('Endpoint not found')
            break
    }
}

export default router