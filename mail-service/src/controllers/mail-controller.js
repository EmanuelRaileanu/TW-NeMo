import APIError from '../../../shared-utilities/APIError.js'
import transporter from '../utils/nodemailer-config.js'

export default class MailController {
    static async send (req, res) {
        if (!req.body) {
            throw new APIError('Request body is required', 400)
        }
        if (!req.body.from) {
            throw new APIError('from is required', 400)
        }
        if (!req.body.to) {
            throw new APIError('to is required', 400)
        }
        if (!req.body.subject) {
            throw new APIError('subject is required', 400)
        }
        if (!req.body.emailBody) {
            throw new APIError('emailBody is required', 400)
        }
        await transporter.sendMail({
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            html: req.body.emailBody
        })
        res.writeHead(200, {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': process.env.CORS_DOMAINS,
            'Access-Control-Allow-Methods': 'OPTIONS, POST',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': 2592000
        })
        return res.end(JSON.stringify({ message: `Email sent successfully to ${req.body.to}` }))
    }
}