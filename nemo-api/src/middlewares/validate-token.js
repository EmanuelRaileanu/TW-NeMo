import request from '../../../shared-utilities/request.js'
import { CORS_HEADERS } from './cors.js'

const validateToken = (func) => async (req, res) => {
    const bearerHeader = req.headers.authorization
    if (!bearerHeader) {
        res.writeHead(401, CORS_HEADERS)
        return res.end(JSON.stringify({ message: 'Unauthorized' }))
    }
    const token = bearerHeader.split(' ')[1]
    const response = await request(`${process.env.AUTH_SERVICE_URL}:${process.env.AUTH_SERVICE_PORT}/auth/validate-token`, 'POST', { token })
    req.user = response
    console.log(response)
    if (response.status !== 401) {
        await Promise.resolve(func(req, res))
    } else {
        res.writeHead(401, CORS_HEADERS)
        return res.end(JSON.stringify({ message: 'Unauthorized' }))
    }
}

export default validateToken