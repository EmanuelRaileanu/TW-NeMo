import MovieController from '../controllers/movie-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'

const router = new Router()

router.get('/', catchErrors(MovieController.getMovies))
router.get('/genres',catchErrors(MovieController.getGenres))
router.get('/:movieId', catchErrors(MovieController.getMovieById))
router.post('/',catchErrors(MovieController.addMovie))
router.put('/:movieId',catchErrors(MovieController.updateMovie))
router.delete('/:movieId',catchErrors(MovieController.deleteMovie))
export default router