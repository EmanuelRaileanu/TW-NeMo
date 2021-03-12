import MovieController from '../controllers/movie-controller.js'

const movieRoutes  = async (req, res) => {
    switch (req.method) {
        case 'GET':
            await MovieController.getMovies(req, res)
            break
        default:
            res.end('Not implemented')
    }
}

export default movieRoutes