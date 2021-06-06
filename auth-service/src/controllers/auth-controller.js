import APIError from '../../../shared-utilities/APIError.js'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import emailValidator from 'email-validator'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import BlacklistedToken from '../models/blacklisted-token.js'
import UserRole, { ROLES } from '../models/user-role.js'
import { sendConfirmationEmail } from '../utils/email-utils.js'
import crypto from 'crypto'
import Bookshelf from '../bookshelf.js'
import { CORS_HEADERS } from '../middlewares/cors.js'

export default class AuthController {
    static async validateUsername (req, res) {
        if (!req.query.username) {
            throw new APIError('username is required', 400)
        }
        const existingUserWithSameUsername = await new User({ username: req.query.username }).fetch({ require: false })
        if (existingUserWithSameUsername) {
            throw new APIError('There is already an user registered with this username', 409) // Conflict
        }
        return res.end(JSON.stringify({ message: 'This username is available' }))
    }

    static async validateEmail (req, res) {
        if (!req.query.email) {
            throw new APIError('email is required', 400)
        }
        if (!emailValidator.validate(req.body.email)) {
            throw new APIError('Invalid email', 400)
        }
        const existingUserWithSameEmail = await new User({ email: req.query.email }).fetch({ require: false })
        if (existingUserWithSameEmail) {
            throw new APIError('There is already an user registered with this email', 409) // Conflict
        }
        return res.end(JSON.stringify({ message: 'This email is available' }))
    }

    static async validateToken (req, res) {
        if (!req.body) {
            throw new APIError('Request body is required', 400)
        }
        if (!req.body.token) {
            throw new APIError('token is required', 400)
        }
        const token = req.body.token
        // Check if the token is blacklisted aka the user logged out
        const blacklistedToken = await new BlacklistedToken({ token }).fetch({ require: false })
        if (blacklistedToken) {
            res.writeHead(401, CORS_HEADERS)
            return res.end(JSON.stringify({ message: 'Unauthorized' }))
        }
        let deserializedUser
        try {
            deserializedUser = await jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            res.writeHead(401, CORS_HEADERS)
            return res.end(JSON.stringify({ message: 'Unauthorized' }))
        }
        if (!deserializedUser) {
            res.writeHead(401, CORS_HEADERS)
            return res.end(JSON.stringify({ message: 'Unauthorized' }))
        }
        const user = await new User({ id: deserializedUser.id }).query(q => {
            q.select('id', 'roleId', 'username', 'email', 'isEmailConfirmed', 'createdAt', 'updatedAt')
        }).fetch({
            require: false,
            withRelated: [{
                role: q => {
                    q.select('id', 'name')
                }
            }]
        })
        console.log(deserializedUser)
        if (!user) {
            res.writeHead(401, CORS_HEADERS)
            return res.end(JSON.stringify({ message: 'Unauthorized' }))
        }
        return res.end(JSON.stringify(user.toJSON({ omitPivot: true })))
    }

    static async register (req, res) {
        if (!req.body) {
            throw new APIError('Request body is required', 400)
        }
        if (!req.body.username) {
            throw new APIError('username is required', 400)
        }
        if (!req.body.email) {
            throw new APIError('email is required', 400)
        }
        if (!emailValidator.validate(req.body.email)) {
            throw new APIError('Invalid email', 400)
        }
        if (!req.body.password) {
            throw new APIError('password is required', 400)
        }
        if (!req.body.confirmedPassword) {
            throw new APIError('confirmedPassword is required', 400)
        }
        if (req.body.password !== req.body.confirmedPassword) {
            throw new APIError('Passwords do not match', 400)
        }
        // Check if there is already an user registered with this username or email first
        const existingUserWithSameUsername = await new User({ username: req.body.username }).fetch({ require: false })
        if (existingUserWithSameUsername) {
            throw new APIError('There is already an user registered with this username', 409) // Conflict
        }
        const existingUserWithSameEmail = await new User({ email: req.body.email }).fetch({ require: false })
        if (existingUserWithSameEmail) {
            throw new APIError('There is already an user registered with this email', 409) // Conflict
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const normalUserRole = await new UserRole({ name: ROLES.NORMAL }).fetch({ require: false })
        if (!normalUserRole) {
            throw new APIError('User role not found', 404)
        }
        let user
        await Bookshelf.transaction(async t => {
            const confirmationToken = crypto.randomBytes(20).toString('hex')
            user = await new User({
                roleId: normalUserRole.id,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                confirmationToken
            }).save(null, { method: 'insert', transacting: t })

            // Send an email with a confirmation link to the user
            await sendConfirmationEmail(req.body.email, confirmationToken)
        })
        if (!user) {
            throw new APIError('Internal server error', 500)
        }
        const expiresAt = moment().add(process.env.TOKEN_LIFETIME.match(/[0-9]+/)[0], 'hours')
        const userToBeSerialized = user.toJSON({ omitPivot: true })
        // Don't send the password hash
        delete userToBeSerialized.password
        const token = await jwt.sign(userToBeSerialized, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_LIFETIME })
        return res.end(JSON.stringify({
            token,
            expiresAt
        }))
    }

    static async login (req, res) {
        if (!req.body) {
            throw new APIError('Request body is required', 400)
        }
        if (!req.body.username) {
            throw new APIError('username is required', 400)
        }
        if (!req.body.password) {
            throw new APIError('password is required', 400)
        }
        const userByUsername = await new User({ username: req.body.username }).fetch({
            require: false,
            withRelated: [{
                role: q => {
                    q.select('id', 'name')
                }
            }]
        })
        const userByEmail = await new User({ email: req.body.username }).fetch({
            require: false,
            withRelated: [{
                role: q => {
                    q.select('id', 'name')
                }
            }]
        })
        if (!userByUsername && !userByEmail) {
            throw new APIError('There is no user registered with this username or email', 404)
        }
        if (userByUsername && !await bcrypt.compare(req.body.password, userByUsername.get('password'))) {
            throw new APIError('Wrong password', 403) // Forbidden
        }
        if (userByEmail && !await bcrypt.compare(req.body.password, userByEmail.get('password'))) {
            throw new APIError('Wrong password', 403)
        }
        const expiresAt = moment().add(process.env.TOKEN_LIFETIME.match(/[0-9]+/)[0], 'hours')
        const userToBeSerialized = userByUsername ? userByUsername.toJSON({ omitPivot: true }) : userByEmail.toJSON({ omitPivot: true })
        // Don't send the password hash
        delete userToBeSerialized.password
        const token = await jwt.sign(userToBeSerialized, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_LIFETIME })
        return res.end(JSON.stringify({
            token,
            expiresAt
        }))
    }

    static async logout (req, res) {
        // Check if the token is somehow already blacklisted (shouldn't happen)
        const blacklistedToken = await new BlacklistedToken({ token: req.token }).fetch({ require: false })
        if (blacklistedToken) {
            throw new APIError('You are already logged out', 400)
        }
        await new BlacklistedToken({ token: req.token }).save()
        return res.end(JSON.stringify({ message: 'Successfully logged out' }))
    }

    static async confirmEmail (req, res) {
        if (!req.query.confirmationToken) {
            throw new APIError('confirmationToken is required', 400)
        }
        const user = await new User({ confirmationToken: req.query.confirmationToken }).fetch({ require: false })
        if (user.get('isEmailConfirmed') === 1) {
            throw new APIError('This email was already confirmed', 400)
        }
        if (user.get('confirmationToken') !== req.query.confirmationToken) {
            throw new APIError('Invalid confirmation token', 400)
        }
        await user.save({ isEmailConfirmed: true }, { method: 'update', patch: true })
        return res.end(JSON.stringify({ message: 'Account successfully confirmed' }))
    }
}