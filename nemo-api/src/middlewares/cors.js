const cors = (func) => async (req, res) => {
    res.writeHead(200, {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_DOMAINS,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': 2592000
    })
    await Promise.resolve(func(req, res))
}

export default cors