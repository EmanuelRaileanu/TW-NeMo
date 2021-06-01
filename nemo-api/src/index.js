import http from 'http'
import movieRoutes from './routes/movie-routes.js'
import dashboardRoutes from './routes/dashboard-routes.js'
import dotenv from 'dotenv'

dotenv.config()

http.createServer(async (req, res) => {
    const startTime = Date.now()
    switch (req.url.split('?')[0].match(/\/[^\/]*/)[0]) {
        case '/':
            res.writeHead(200, { 'Content-type': 'application/json' })
            res.end(JSON.stringify({
                name: process.env.npm_package_name,
                version: process.env.npm_package_version
            }))
            break
        case '/movies':
            await movieRoutes.next(req, res)
            break
        case '/dashboard':
            await dashboardRoutes.next(req, res)
            break
        default:
            res.writeHead(501, { 'Content-type': 'application/json' })
            return res.end(JSON.stringify({ message: "Not implemented" }))
    }
    res.on('finish', () => console.log(req.method, req.url, res.statusCode, Date.now() - startTime, 'ms'))
}).listen(process.env.SERVER_PORT, () => {
    console.log(`Listening on port ${process.env.SERVER_PORT}...`)
})