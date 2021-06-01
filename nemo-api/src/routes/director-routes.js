import DirectorController from '../controllers/director-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/', cors(catchErrors(DirectorController.getDirectors)))
router.get('/:directorId', cors(catchErrors(DirectorController.getDirectorById)))
router.post('/', cors(catchErrors(DirectorController.addDirector)))
router.put('/:directorId', cors(catchErrors(DirectorController.updateDirector)))
router.delete('/:directorId', cors(catchErrors(DirectorController.deleteDirector)))

export default router