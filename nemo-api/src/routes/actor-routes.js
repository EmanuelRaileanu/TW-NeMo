import ActorController from '../controllers/actor-controller.js'
import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catchErrors.js'

const router = new Router()

router.get('/', catchErrors(ActorController.getActors))
router.get('/:actorId', catchErrors(ActorController.getActorById))
router.post('/', catchErrors(ActorController.addActor))
router.put('/:actorId', catchErrors(ActorController.updateActor))
router.delete('/:actorId', catchErrors(ActorController.deleteActor))
export default router