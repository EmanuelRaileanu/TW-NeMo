import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catch-errors.js'
import UserController from '../controllers/user-controller.js'
import validateToken from '../middlewares/validate-token.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.post('/change-username', cors(catchErrors(validateToken(UserController.changeUsername))))
router.post('/change-email', cors(catchErrors(validateToken(UserController.changeEmail))))
router.post('/change-password', cors(catchErrors(validateToken(UserController.changePassword))))

export default router