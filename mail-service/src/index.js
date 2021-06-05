import http from 'http'
import dotenv from 'dotenv'
import mailRoutes from './routes/mail-routes.js'
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
        case '/emails':
            await mailRoutes.next(req, res)
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