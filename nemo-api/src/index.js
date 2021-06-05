import http from 'http'
import movieRoutes from './routes/movie-routes.js'
import actorRoutes from './routes/actor-routes.js'
import directorRoutes from './routes/director-routes.js'
import productionCompanyRoutes from './routes/production-company-routes.js'
import tvShowRoutes from './routes/tv-show-routes.js'
import tvSeasonRoutes from './routes/tv-season-routes.js'
import tvEpisodeRoutes from './routes/tv-episode-routes.js'
import dotenv from 'dotenv'
import fs from 'fs'
import { exec } from 'child_process'
import util from 'util'

const promisifiedExec = util.promisify(exec)
const promisifiedReadFile = util.promisify(fs.readFile)

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
        case '/actors':
            await actorRoutes.next(req, res)
            break
        case '/directors':
            await directorRoutes.next(req, res)
            break
        case '/productionCompanies':
            await productionCompanyRoutes.next(req, res)
            break
        case '/shows':
            await tvShowRoutes.next(req, res)
            break
        case '/seasons':
            await tvSeasonRoutes.next(req, res)
            break
        case '/episodes':
            await tvEpisodeRoutes.next(req, res)
            break
        case '/docs':
            await promisifiedExec("redoc-cli bundle ./src/swagger-doc.yaml -o ./src/doc.html")
            res.end((await promisifiedReadFile('./src/doc.html')).toString())
            break
        default:
            res.writeHead(501, { 'Content-type': 'application/json' })
            return res.end(JSON.stringify({ message: "Not implemented" }))
    }
    res.on('finish', () => console.log(req.method, req.url, res.statusCode, Date.now() - startTime, 'ms'))
}).listen(process.env.SERVER_PORT, () => {
    console.log(`Listening on port ${process.env.SERVER_PORT}...`)
})