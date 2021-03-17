class DashboardController {
    static async getDashboard (req, res) {
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify({ ok: true }))
    }
}

export default DashboardController