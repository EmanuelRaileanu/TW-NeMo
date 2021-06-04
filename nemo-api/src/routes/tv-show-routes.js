import TvShowController from '../controllers/tv-show-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/', cors(catchErrors(TvShowController.getTvShows)))
router.get('/genres', cors(catchErrors(TvShowController.getGenres)))
router.get('/:showId', cors(catchErrors(TvShowController.getTvShowById)))
router.post('/', cors(catchErrors(TvShowController.addShow)))
router.put('/:showId', cors(catchErrors(TvShowController.updateShow)))
router.delete('/:showId', cors(catchErrors(TvShowController.deleteShow)))

export default router