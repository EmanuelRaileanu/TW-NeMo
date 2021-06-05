import DirectorController from '../controllers/director-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/', cors(catchErrors(DirectorController.getDirectors)))
router.get('/:directorId', cors(catchErrors(DirectorController.getDirectorById)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(DirectorController.addDirector))))
router.put('/:directorId', cors(catchErrors(validateToken(DirectorController.updateDirector))))
router.delete('/:directorId', cors(catchErrors(validateToken(DirectorController.deleteDirector))))

export default router