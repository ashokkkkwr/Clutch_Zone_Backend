
import type {Router as IRouter} from 'express'
import Router from 'express'
import gameController from '../controller/game.controller'
// import scoreSubmissionController from '../controller/scoreSubmission.controller'
import dashboardController from '../controller/dashboard.controller'
import {catchAsync} from '../utils/catchAsync.utils'
import {scoreSubmissionUpload} from '../middleware/multer.middleware'
import { authentication } from '../middleware/authentication.middleware'
const router:IRouter=Router()
// router.post('/create/:id', authentication(),scoreSubmissionUpload.fields([{ name: 'score_submission_image' }]),catchAsync(scoreSubmissionController.createSubmission));
// router.get('/',catchAsync(gameController.getGames))
// router.get('/:id',catchAsync(gameController.getGame))
// router.patch('/update/:id',  gamesImagesUpload.fields([{ name: 'game_cover_image' }, { name: 'game_icon' }]),
// catchAsync(gameController.updateGame))
// router.delete('/:id',catchAsync(gameController.deleteGame))
// router.get('/get/:id',catchAsync(scoreSubmissionController.getSubmission))  
router.get('/get',catchAsync(dashboardController.getAdminDashboardStats))
// router.patch('/decision/:id',authentication(),catchAsync(scoreSubmissionController.giveDecision))

export default router