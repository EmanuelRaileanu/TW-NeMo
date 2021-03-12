
class DashboardController {
    getDashboard (req, res) {
        res.writeHead(200, { 'Content-type': 'application/json' })
        res.end(JSON.stringify({ok: true}))
    }
}

export default new DashboardController()