
import type {Router as IRouter} from 'express'
import Router from 'express'
import gameController from '../controller/game.controller'
import scoreSubmissionController from '../controller/scoreSubmission.controller'
import {catchAsync} from '../utils/catchAsync.utils'
import {scoreSubmissionUpload} from '../middleware/multer.middleware'

const router:IRouter=Router()
router.post('/create/:id', scoreSubmissionUpload.fields([{ name: 'score_submission_image' }]),catchAsync(scoreSubmissionController.createSubmission));
// router.get('/',catchAsync(gameController.getGames))
// router.get('/:id',catchAsync(gameController.getGame))
// router.patch('/update/:id',  gamesImagesUpload.fields([{ name: 'game_cover_image' }, { name: 'game_icon' }]),
// catchAsync(gameController.updateGame))
// router.delete('/:id',catchAsync(gameController.deleteGame))
export default router
