import MovieController from '../controllers/movie-controller.js'
import Router from "../router.js";

const router = new Router()

router.get('/', MovieController.getMovies)
router.get('/:movieId', (req, res) => res.end('You did it'))

export default router