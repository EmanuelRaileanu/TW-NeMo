import ActorController from '../controllers/actor-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/', cors(catchErrors(ActorController.getActors)))
router.get('/:actorId', cors(catchErrors(ActorController.getActorById)))
router.post('/', cors(catchErrors(ActorController.addActor)))
router.put('/:actorId', cors(catchErrors(ActorController.updateActor)))
router.delete('/:actorId', cors(catchErrors(ActorController.deleteActor)))

export default router