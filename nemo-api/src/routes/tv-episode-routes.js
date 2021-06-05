import TvEpisodeController from "../controllers/tv-episode-controller.js";
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/:episodeId', cors(catchErrors(TvEpisodeController.getEpisodeById)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(TvEpisodeController.addEpisode))))
router.put('/:episodeId', cors(catchErrors(validateToken(TvEpisodeController.updateEpisode))))
router.delete('/:episodeId', cors(catchErrors(validateToken(TvEpisodeController.deleteEpisode))))

export default router