import TvEpisodeController from "../controllers/tv-episode-controller.js";
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/of/:tvSeasonId', cors(catchErrors(TvEpisodeController.getEpisodesOf)))
router.get('/:episodeId', cors(catchErrors(TvEpisodeController.getEpisodeById)))
router.post('/', cors(catchErrors(TvEpisodeController.addEpisode)))
router.put('/:episodeId', cors(catchErrors(TvEpisodeController.updateEpisode)))
router.delete('/:episodeId', cors(catchErrors(TvEpisodeController.deleteEpisode)))

export default router