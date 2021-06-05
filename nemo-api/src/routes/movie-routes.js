import MovieController from '../controllers/movie-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/', cors(catchErrors(MovieController.getMovies)))
router.get('/genres', cors(catchErrors(MovieController.getGenres)))
router.get('/:movieId', cors(catchErrors(MovieController.getMovieById)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(MovieController.addMovie))))
router.put('/:movieId', cors(catchErrors(validateToken(MovieController.updateMovie))))
router.delete('/:movieId', cors(catchErrors(validateToken(MovieController.deleteMovie))))

router.post('/:movieId/reviews', cors(catchErrors(validateToken(MovieController.addReview))))
router.put('/:movieId/reviews', cors(catchErrors(validateToken(MovieController.updateReview))))
router.delete('/:movieId/reviews', cors(catchErrors(validateToken(MovieController.deleteReview))))

router.get('/favorites', cors(catchErrors(validateToken(MovieController.getFavorites))))

export default router