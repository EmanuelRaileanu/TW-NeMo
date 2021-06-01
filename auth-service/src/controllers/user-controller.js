import APIError from '../../../shared-utilities/APIError.js'
import emailValidator from 'email-validator'
import bcrypt from 'bcrypt'
import Bookshelf from '../bookshelf.js'
import { sendConfirmationEmail } from '../utils/email-utils.js'

export default class UserController {
    static async changeUsername (req, res) {
        if (!req.body) {
            throw new APIError('Request body is required', 400)
        }
        if (!req.body.username) {
            throw new APIError('username is required', 400)
        }
        await req.user.save({ username: req.body.username }, { method: 'update', patch: true })
        return res.end(JSON.stringify({ message: 'Username changed' }))
    }

    static async changeEmail (req, res) {
        if (!req.body) {
            throw new APIError('Request body is required', 400)
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
        if (!await bcrypt.compare(req.body.password, req.user.get('password'))) {
            throw new APIError('Wrong password', 403) // Forbidden
        }
        await Bookshelf.transaction(async t => {
            await req.user.save({ email: req.body.email, isEmailConfirmed: false }, {
                method: 'update',
                patch: true,
                transacting: t
            })
            await sendConfirmationEmail(req.body.email, req.user.get('confirmationToken'))
        })
        return res.end(JSON.stringify({ message: 'Email address changed. Please check your email in order to verify your account again.' }))
    }

    static async changePassword (req, res) {
        if (!req.body) {
            throw new APIError('Request body is required', 400)
        }
        if (!req.body.oldPassword) {
            throw new APIError('oldPassword is required', 400)
        }
        if (!await bcrypt.compare(req.body.oldPassword, req.user.get('password'))) {
            throw new APIError('Wrong password', 403) // Forbidden
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
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        await req.user.save({ password: hashedPassword }, { method: 'update', patch: true })
        return res.end(JSON.stringify({ message: 'Password changed' }))
    }
}