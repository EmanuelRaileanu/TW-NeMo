const [http, https] = [require('http'), require('https')]

const request = async (url, method = 'GET', requestBody) => {
    const lib = url.startsWith('https://') ? https : http
    const [host, path] = [url.split('://')[1].split('/')[0], url.split('://')[1].substr(url.split('://')[1].indexOf('/'))]
    const [, port] = host.split(':')
    const params = {
        method,
        host,
        port: port || url.startsWith('https://') ? 443 : 80,
        path: path || '/'
    }
    return new Promise((resolve, reject) => {
        const req = lib.request(params, res => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Status code: ${res.statusCode}`))
            }
            let data = ''
            res.on('data', chunk => {
                data += chunk
            })
            res.on('end', () => resolve(data))
        })
        req.on('error', reject)
        if (requestBody) {
            req.write(requestBody)
        }
        req.end()
    })
}

module.exports = request