import MovieController from '../controllers/movie-controller.js'
import Router from '../util/router.js'
import catchErrors from '../middlewares/catchErrors.js'

const router = new Router()

router.get('/', catchErrors(MovieController.getMovies))
router.get('/:movieId', (req, res) => res.end('You did it'))

export default router