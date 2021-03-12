import http from 'http'
import router from "./router.js";

class Server {
    constructor () {
        this.server = http.createServer(async (req, res) => {
            await router(req, res)
        })
    }

    listen (port) {
        this.server.listen(port)
    }
}

const server = new Server()
console.log('Listening on port 8001...')
server.listen(8001)