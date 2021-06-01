import request from '../../../shared-utilities/request.js'

export const sendConfirmationEmail = async (email, confirmationToken) => {
    const confirmationLink = `${process.env.SERVER_URL}:${process.env.SERVER_PORT}/auth/confirm-email?confirmationToken=${confirmationToken}`
    return await request(`${process.env.MAIL_SERVICE_URL}:${process.env.MAIL_SERVICE_PORT}/emails`, 'POST', {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: '[NeMo] Account confirmation',
        emailBody: `
            <h1>Email Confirmation</h1>
            <p>To confirm your account, please access the following link:</p>
            <a href="${confirmationLink}">${confirmationLink}</a>
        `
    })
}