import Router from '../../../shared-utilities/router.js'
import catchErrors from '../middlewares/catch-errors.js'
import MailController from '../controllers/mail-controller.js'

const router = new Router()

router.post('/', catchErrors(MailController.send))

export default router