import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catch-errors.js'
import AuthController from '../controllers/auth-controller.js'
import validateToken from '../middlewares/validate-token.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.get('/validate-username', cors(catchErrors(AuthController.validateUsername)))
router.get('/validate-email', cors(catchErrors(AuthController.validateEmail)))
router.get('/confirm-email', cors(catchErrors(AuthController.confirmEmail)))

router.post('/validate-token', cors(catchErrors(AuthController.validateToken)))

router.post('/register', cors(catchErrors(AuthController.register)))
router.post('/login', cors(catchErrors(AuthController.login)))
router.post('/logout', cors(catchErrors(validateToken(AuthController.logout))))

export default router