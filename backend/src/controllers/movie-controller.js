
class MovieController {
    getMovies (req, res) {
        res.writeHead(200, { 'Content-type': 'application/json' })
        res.end(JSON.stringify({movies: ['Inception', 'The dark knight']}))
    }
}

export default new MovieController()