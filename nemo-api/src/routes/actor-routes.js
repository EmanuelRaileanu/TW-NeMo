import ActorController from '../controllers/actor-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'
import validateToken from '../middlewares/validate-token.js'

const router = new Router()

router.get('/', cors(catchErrors(ActorController.getActors)))
router.get('/:actorId', cors(catchErrors(ActorController.getActorById)))

// Admin routes
router.post('/', cors(catchErrors(validateToken(ActorController.addActor))))
router.put('/:actorId', cors(catchErrors(validateToken(ActorController.updateActor))))
router.delete('/:actorId', cors(catchErrors(validateToken(ActorController.deleteActor))))

export default router