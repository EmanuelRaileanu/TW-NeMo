class MovieController {
    static async getMovies (req, res) {
        res.writeHead(200, { 'Content-type': 'application/json' })
        return res.end(JSON.stringify({ movies: ['Inception', 'The dark knight'] }))
    }
}

export default MovieController