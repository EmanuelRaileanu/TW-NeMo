import TvSeasonController from "../controllers/tv-season-controller.js"
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/of/:tvShowId', cors(catchErrors(TvSeasonController.getSeasonsOf)))
router.get('/:seasonId', cors(catchErrors(TvSeasonController.getSeasonById)))
router.post('/', cors(catchErrors(TvSeasonController.addSeason)))
router.put('/:seasonId', cors(catchErrors(TvSeasonController.updateSeason)))
router.delete('/:seasonId', cors(catchErrors(TvSeasonController.deleteSeason)))

export default router