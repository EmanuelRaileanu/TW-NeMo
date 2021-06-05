import TvSeasonController from "../controllers/tv-season-controller.js"
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/:seasonId', cors(catchErrors(TvSeasonController.getSeasonById)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(TvSeasonController.addSeason))))
router.put('/:seasonId', cors(catchErrors(validateToken(TvSeasonController.updateSeason))))
router.delete('/:seasonId', cors(catchErrors(validateToken(TvSeasonController.deleteSeason))))

export default router