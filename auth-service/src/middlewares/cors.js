const cors = (func) => async (req, res) => {
    res.writeHead(200, {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000
    })
    await Promise.resolve(func(req, res))
}

export default cors