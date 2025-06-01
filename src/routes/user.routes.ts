import type { Router as IRouter } from 'express'
import Router from 'express'
// import   from '../controller/user.controller'

import userController from '../controller/user.controller'
import { catchAsync } from '../utils/catchAsync.utils'
import upload from '../utils/fileUpload'
import { authentication } from '../middleware/authentication.middleware'
import { profileImagesUpload } from '../middleware/multer.middleware'
const router: IRouter = Router()

// const userAuthController = new UserAuthController()
// router.post('/new-signup',upload.array('files'),catchAsync(userAuthController.))

// router.post('/register', upload.array('files'),catchAsync(.create))

router.patch('/change-password',authentication(),catchAsync(userController.changePassword))
router.post('/verify-email', catchAsync(userController.verifyEmail))
router.post('/verify-otp', catchAsync(userController.verifyOtp))
router.post('/reset-password',catchAsync(userController.resetPassword))
router.post('/register',profileImagesUpload.fields([{name:'image'}]),catchAsync(userController.create))
router.patch('/update-profile/:id',profileImagesUpload.fields([{name:'image'}]),catchAsync(userController.updateProfile))


router.get('/get-notification',authentication(),catchAsync(userController.getNotification))
router.post('/mark-as-read',authentication(),catchAsync(userController.markAsRead))
router.patch('/bio',authentication(),catchAsync(userController.updateBio))
// router.get('/', catchAsync(userAuthController.getAll))
// router.get('/one/:id',userAuthController.getOne)
// router.use(authentication())
// router.patch('/update-media',upload.array('files'),catchAsync(userAuthController.updateProfile))
// router.get('/byToken',userAuthController.getByToken)
// router.delete('/:id',userAuthController.delete)
router.get('/get-all-users',catchAsync(userController.getAllUsers))
router.delete('/delete-user/:id',catchAsync(userController.deleteUser))
export default router