
import type {Router as IRouter} from 'express'
import Router from 'express'
import gameController from '../controller/game.controller'
// import scoreSubmissionController from '../controller/scoreSubmission.controller'
import favouriteController from '../controller/favourite.controller'

import {catchAsync} from '../utils/catchAsync.utils'
import {scoreSubmissionUpload} from '../middleware/multer.middleware'
import { authentication } from '../middleware/authentication.middleware'
const router:IRouter=Router();
router.use(authentication())
router.post('/add-favourite',catchAsync(favouriteController.addFavourite));
router.get('/get-favourite',catchAsync(favouriteController.getUserFavouriteGames));
export default router