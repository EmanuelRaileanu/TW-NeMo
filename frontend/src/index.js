import http from 'http'
import dotenv from 'dotenv'

dotenv.config()

http.createServer(async (req, res) => {
    switch (req.url.split('?')[0].match(/\/[^\/]*/)[0]) {
        case '/':
            res.writeHead(200, { 'Content-type': 'application/json' })
            res.end(JSON.stringify({
                name: process.env.npm_package_name,
                version: process.env.npm_package_version
            }))
            break
        default:
            res.writeHead(501, { 'Content-type': 'application/json' })
            return res.end(JSON.stringify({ message: "Not implemented" }))
    }
}).listen(process.env.SERVER_PORT, () => {
    console.log(`Listening on port ${process.env.SERVER_PORT}...`)
})