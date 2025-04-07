// import type{Router as IRouter} from 'express'   
// import Router from 'express'    
// import tournamentController from '../controller/tournament.controller'  
// import {catchAsync} from '../utils/catchAsync.utils'    
// import {tournamentImagesUpload} from '../middleware/multer.middleware'
// const router:IRouter=Router()   
// router.post('/create',tournamentImagesUpload.fields([{name:'tournament_icon'},{name:'tournament_cover'}]),catchAsync(tournamentController.createTournament))
// router.get('/bracket/:id',tournamentController.fetchBrackets)
// export default router   

import type {Router as IRouter} from 'express';
import Router from 'express';
import teamController from '../controller/team.controller';
import { catchAsync } from '../utils/catchAsync.utils';
import { teamImagesUpload, teamMediaUpload } from '../middleware/multer.middleware';
import {authentication} from '../middleware/authentication.middleware';
const router: IRouter = Router();

router.post('/create',authentication(),teamImagesUpload.fields([{name:'image'}]),catchAsync(teamController.createTeam))
router.post(
    '/media/upload',
    authentication(),
    teamMediaUpload.fields([
      { name: 'image' },
      { name: 'video' }
    ]),
    catchAsync(teamController.uploadTeamMedia)
  );
  router.get('/media',authentication(),catchAsync(teamController.getTeamMedia))

export default router;
