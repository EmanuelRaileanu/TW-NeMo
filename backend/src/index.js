import http from 'http'
import movieRoutes from "./routes/movie-routes.js";
import dashboardRouts from './routes/dashboard-routes.js'


export class Server {
    constructor () {
        this.server = http.createServer(async (req, res) => {
            switch (req.url.match(/\/[^\/]+/)[0]) {
                case '/':
                    res.end('Root')
                    break
                case '/movies':
                    await movieRoutes.next(req, res)
                    break
                case '/dashboard':
                    await dashboardRouts.next(req, res)
                    break
                default:
                    res.end('Not implemented')
            }
        })
    }

    listen (port) {
        this.server.listen(port, () => console.log(`Listening on port ${port}...`))
    }
}

const server = new Server()
server.listen(8001)