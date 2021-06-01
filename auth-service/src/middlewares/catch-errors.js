const catchErrors = (func) => async (req, res) => {
        try {
            await Promise.resolve(func(req, res))
        } catch (err) {
            console.log(err)
            res.writeHead(err.status, { 'Content-type': 'application/json' })
            return res.end(JSON.stringify(err))
        }
    }

export default catchErrors