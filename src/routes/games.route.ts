// import type { Router as IRouter } from 'express'
// import Router from 'express'
// // import { UserAuthController } from '../controller/userAuth.controller'
// import { catchAsync } from '../utils/catchAsync.utils'
// import upload from '../utils/fileUpload'
// import { authentication } from '../middleware/authentication.middleware'
// const router: IRouter = Router()

// // const userAuthController = new UserAuthController()
// // router.post('/new-signup',upload.array('files'),catchAsync(userAuthController.))

// // router.post('/register', upload.array('files'),catchAsync(.create))

// // router.patch('/update/:id',upload.array('files'),catchAsync(userAuthController.update))

// // router.get('/', catchAsync(userAuthController.getAll))
// // router.get('/one/:id',userAuthController.getOne)
// // router.use(authentication())
// // router.patch('/update-media',upload.array('files'),catchAsync(userAuthController.updateProfile))

// // router.get('/byToken',userAuthController.getByToken)
// // router.delete('/:id',userAuthController.delete)
// export default router

import type {Router as IRouter} from 'express'
import Router from 'express'
import gameController from '../controller/game.controller'
import {catchAsync} from '../utils/catchAsync.utils'
import {gamesImagesUpload} from '../middleware/multer.middleware'
const router:IRouter=Router()
router.post('/create', gamesImagesUpload.fields([{ name: 'game_cover_image' }, { name: 'game_icon' }]),catchAsync(gameController.createGame))
// router.get('/',catchAsync(gameController.getGames))
router.get('/:id',catchAsync(gameController.getGame))
router.patch('/update/:id',  gamesImagesUpload.fields([{ name: 'game_cover_image' }, { name: 'game_icon' }]),
catchAsync(gameController.updateGame))
// router.delete('/:id',catchAsync(gameController.deleteGame))
export default router
