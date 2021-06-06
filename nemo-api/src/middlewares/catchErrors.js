import { CORS_HEADERS } from './cors.js'

const catchErrors = (func) => async (req, res) => {
        try {
            await Promise.resolve(func(req, res))
        } catch (err) {
            console.log(err)
            res.writeHead(err.status, CORS_HEADERS)
            return res.end(JSON.stringify(err))
        }
    }

export default catchErrors