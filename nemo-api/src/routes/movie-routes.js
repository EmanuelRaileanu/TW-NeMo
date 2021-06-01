import MovieController from '../controllers/movie-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/', cors(catchErrors(MovieController.getMovies)))
router.get('/genres', cors(catchErrors(MovieController.getGenres)))
router.get('/:movieId', cors(catchErrors(MovieController.getMovieById)))
router.post('/', cors(catchErrors(MovieController.addMovie)))
router.put('/:movieId', cors(catchErrors(MovieController.updateMovie)))
router.delete('/:movieId', cors(catchErrors(MovieController.deleteMovie)))

export default router