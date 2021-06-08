import TvShowController from '../controllers/tv-show-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/', cors(catchErrors(TvShowController.getTvShows)))
router.get('/genres', cors(catchErrors(TvShowController.getGenres)))
router.get('/:showId', cors(catchErrors(TvShowController.getTvShowById)))

router.get('/export', cors(catchErrors(TvShowController.exportTvShows)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(TvShowController.addShow))))
router.put('/:showId', cors(catchErrors(validateToken(TvShowController.updateShow))))
router.delete('/:showId', cors(catchErrors(validateToken(TvShowController.deleteShow))))

router.post('/:showId/reviews', cors(catchErrors(validateToken(TvShowController.addReview))))
router.put('/:showId/reviews', cors(catchErrors(validateToken(TvShowController.updateReview))))
router.delete('/:showId/reviews', cors(catchErrors(validateToken(TvShowController.deleteReview))))

router.get('/favorites', cors(catchErrors(validateToken(TvShowController.getFavorites))))
router.post('/:showId/add-favorite', cors(catchErrors(validateToken(TvShowController.addFavorite))))
router.delete('/:showId/delete-favorite', cors(catchErrors(validateToken(TvShowController.deleteFavorite))))

export default router