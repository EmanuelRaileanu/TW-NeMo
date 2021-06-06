const catchErrors = (func) => async (req, res) => {
        try {
            await Promise.resolve(func(req, res))
        } catch (err) {
            console.log(err)
            res.writeHead(err.status, {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': process.env.CORS_DOMAINS,
                'Access-Control-Allow-Methods': 'OPTIONS, POST',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Max-Age': 2592000
            })
            return res.end(JSON.stringify(err))
        }
    }

export default catchErrors