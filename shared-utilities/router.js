const qs = require('querystring')

const CORS_HEADERS = {
    'Content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': 2592000
}

class Router {
    constructor () {
        this.routers = {}
        this.methods = {
            GET: [],
            POST: [],
            PUT: [],
            DELETE: []
        }
    }

    use (path, router) {
        this.routers[path.substr(path.replace('/', '').indexOf('/') + 1)] = router
    }

    async next (req, res) {
        const [url, queryParams] = req.url.split('?')
        let rawQueryParams = qs.parse(queryParams)
        for (const property in rawQueryParams) {
            if (property.includes('[')) {
                const splitProperty = property.split('[')
                if (!rawQueryParams[splitProperty[0]]) {
                    rawQueryParams[splitProperty[[0]]] = {}
                }
                rawQueryParams[splitProperty[[0]]][splitProperty[1].replace(']', '')] =
                    Array.isArray(rawQueryParams[property]) ? rawQueryParams[property] : [rawQueryParams[property]]
                delete rawQueryParams[property]
            }
        }
        req.query = rawQueryParams
        const splitUrl = url.split('/').filter(item => item !== '')
        let hasParams = false
        req.params = {}
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', async () => {
            if (body) {
                req.body = JSON.parse(body)
            }
            if (splitUrl.length > 1 && (splitUrl[1].length === 36 || (splitUrl.length === 2 && splitUrl[0] === 'users' && !['change-username', 'change-email', 'change-password'].includes(splitUrl[1])))) {
                const methodOption = this.methods[req.method].find(item => item.hasParams)
                if (!methodOption) {
                    res.writeHead(501, CORS_HEADERS)
                    return res.end(JSON.stringify({ message: "Not implemented" }))
                }
                req.params[methodOption.path.match(/(?<=:).*/)[0].split('/')[0]] = splitUrl[1]
                hasParams = true
            }
            if (splitUrl.length > 2) {
                req.url = req.url.replace('/', '')
                req.url = req.url.substr(req.url.replace('/', '').indexOf('/') + 1)
                if (this.routers.hasOwnProperty('/' + splitUrl[2])) {
                    return await this.routers['/' + splitUrl[2]].next(req, res)
                } else if (this.methods[req.method].find(item => item.hasParams === hasParams && item.path.replace('/', '').split('/')[1] === splitUrl[2])) {
                    return await this.methods[req.method].find(item => item.hasParams === hasParams && item.path.replace('/', '').split('/')[1] === splitUrl[2]).controllerMethod(req, res)
                }
            } else if (splitUrl.length === 1 && this.methods[req.method].find(item => item.hasParams === hasParams)) {
                return await this.methods[req.method].find(item => item.hasParams === hasParams).controllerMethod(req, res)
            } else if (splitUrl.length === 2 && this.methods[req.method].find(item => item.hasParams === hasParams && item.path.split('/')[1])) {
                if (['change-username', 'change-email', 'change-password'].includes(splitUrl[1])) {
                    return await this.methods[req.method].find(item => item.hasParams === hasParams && item.path.split('/')[1] && item.path.split('/')[1] === splitUrl[1]).controllerMethod(req, res)
                }
                return await this.methods[req.method].find(item => item.hasParams === hasParams && item.path.split('/')[1] && (item.path.split('/')[1] === splitUrl[1] || splitUrl[1].length === 36 || (splitUrl.length === 2 && splitUrl[0] === 'users'))).controllerMethod(req, res)
            } else if (splitUrl.length === 2 && !splitUrl[1] && this.methods[req.method].find(item => item.hasParams === hasParams && splitUrl.length === item.path.split('/').length)) {
                return await this.methods[req.method].find(item => item.hasParams === hasParams).controllerMethod(req, res)
            }
            res.writeHead(501, CORS_HEADERS)
            return res.end(JSON.stringify({ message: "Not implemented" }))
        })
    }

    get (path, controllerMethod) {
        this.methods.GET.push({
            hasParams: !!path.match(/(?<=:)[^\/]+/),
            path,
            controllerMethod
        })
    }

    post (path, controllerMethod) {
        this.methods.POST.push({
            hasParams: !!path.match(/(?<=:)[^\/]+/),
            path,
            controllerMethod
        })
    }

    put (path, controllerMethod) {
        this.methods.PUT.push({
            hasParams: !!path.match(/(?<=:)[^\/]+/),
            path,
            controllerMethod
        })
    }

    delete (path, controllerMethod) {
        this.methods.DELETE.push({
            hasParams: !!path.match(/(?<=:)[^\/]+/),
            path,
            controllerMethod
        })
    }
}

module.exports = Router