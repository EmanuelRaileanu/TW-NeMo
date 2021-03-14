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
        const splitUrl = req.url.split('/').filter(item => item !== '')
        let hasParams = false
        req.params = {}
        if (splitUrl.length > 1) {
            const methodOption = this.methods[req.method].find(item => item.hasParams)
            req.params[methodOption.path.match(/(?<=:).*/)[0]] = splitUrl[1]
            hasParams = true
        }
        if (splitUrl.length > 2 && this.routers.hasOwnProperty('/' + splitUrl[2])) {
            req.url = req.url.replace('/', '')
            req.url = req.url.substr(req.url.replace('/', '').indexOf('/') + 1)
            await this.routers['/' + splitUrl[2]].next(req, res)
        } else {
            await this.methods[req.method].find(item => item.hasParams === hasParams).controllerMethod(req, res)
        }
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

export default Router