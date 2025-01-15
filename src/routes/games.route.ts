
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
