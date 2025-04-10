 

import type {Router as IRouter} from 'express';
import Router from 'express';

import leaderboardController from '../controller/leaderboard.controller';
import paymentController from '../controller/payment.controller';
import { catchAsync } from '../utils/catchAsync.utils';
import { buckImagesUpload } from '../middleware/multer.middleware';
import {authentication} from '../middleware/authentication.middleware';
const router: IRouter = Router();
router.get('/get-leaderboard',catchAsync(leaderboardController.getLeaderBoard));

export default router;
