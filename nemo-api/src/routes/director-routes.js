import DirectorController from '../controllers/director-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'

const router = new Router()

router.get('/', catchErrors(DirectorController.getDirectors))
router.get('/:directorId', catchErrors(DirectorController.getDirectorById))
router.post('/', catchErrors(DirectorController.addDirector))
router.put('/:directorId', catchErrors(DirectorController.updateDirector))
router.delete('/:directorId', catchErrors(DirectorController.deleteDirector))
export default router