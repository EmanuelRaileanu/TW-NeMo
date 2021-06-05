import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import BlacklistedToken from '../models/blacklisted-token.js'

const validateToken = (func) => async (req, res) => {
    const bearerHeader = req.headers.authorization
    if (!bearerHeader) {
        res.writeHead(401, { 'Content-Type': 'text' })
        return res.end('Unauthorized')
    }
    const token = bearerHeader.split(' ')[1]
    // Check if the token is blacklisted aka the user logged out
    const blacklistedToken = await new BlacklistedToken({ token }).fetch({ require: false })
    if (blacklistedToken) {
        res.writeHead(401, { 'Content-Type': 'text' })
        return res.end('Unauthorized')
    }
    let authData
    try {
        authData = await jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        res.writeHead(401, { 'Content-Type': 'text' })
        return res.end('Unauthorized')
    }
    if (!authData) {
        res.writeHead(401, { 'Content-Type': 'text' })
        return res.end('Unauthorized')
    }
    req.token = token
    req.user = await new User({ id: authData.id }).fetch({ require: false })
    if (!req.user) {
        res.writeHead(401, { 'Content-Type': 'text' })
        return res.end('Unauthorized')
    }
    await Promise.resolve(func(req, res))
}

export default validateToken