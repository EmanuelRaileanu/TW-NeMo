import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catch-errors.js'
import UserController from '../controllers/user-controller.js'
import validateToken from '../middlewares/validate-token.js'
import cors from '../middlewares/cors.js'

const router = new Router()

router.put('/change-username', cors(catchErrors(validateToken(UserController.changeUsername))))
router.put('/change-email', cors(catchErrors(validateToken(UserController.changeEmail))))
router.put('/change-password', cors(catchErrors(validateToken(UserController.changePassword))))

// Public endpoint; can be accessed while not logged in
router.get('/:username', cors(catchErrors(UserController.getUserByUsername)))

// Admin routes
router.put('/:userId/change-role', cors(catchErrors(validateToken(UserController.changeUserRole))))

export default router