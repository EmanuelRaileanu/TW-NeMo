import dotenv from 'dotenv'

dotenv.config()

const cors = (func) => async (req, res) => {
    res.writeHead(200, CORS_HEADERS)
    await Promise.resolve(func(req, res))
}

export const CORS_HEADERS = {
    'Content-type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_DOMAINS,
    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': 2592000
}

export default cors