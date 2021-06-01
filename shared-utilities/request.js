const APIError = require('./APIError.js')

const [http, https] = [require('http'), require('https')]

const request = async (url, method = 'GET', requestBody, headers = {}) => {
    const lib = url.startsWith('https://') ? https : http
    const [host, path] = [url.split('://')[1].split('/')[0], url.split('://')[1].substr(url.split('://')[1].indexOf('/'))]
    const [domain, port] = host.split(':')
    const params = {
        method,
        host: domain,
        port: Number(port || (url.startsWith('https://') ? 443 : 80)),
        path: path || '/',
        headers
    }
    return new Promise((resolve, reject) => {
        const req = lib.request(params, res => {
            let data = ''
            res.on('data', chunk => {
                data += chunk
            })
            res.on('end', () => {
                if (res.headers['content-type'].includes('application/json')) {
                    data = JSON.parse(data)
                }
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new APIError(data['status_message'], res.statusCode))
                }
                return resolve(data)
            })
        })
        req.on('error', reject)
        if (requestBody) {
            req.write(JSON.stringify(requestBody))
        }
        req.end()
    })
}

module.exports = request