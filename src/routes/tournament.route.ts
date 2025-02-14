import type{Router as IRouter} from 'express'   
import Router from 'express'    
import tournamentController from '../controller/tournament.controller'  
import {catchAsync} from '../utils/catchAsync.utils'    
import {tournamentImagesUpload} from '../middleware/multer.middleware'
import { authentication } from '../middleware/authentication.middleware'
const router:IRouter=Router()   
router.post('/create',tournamentImagesUpload.fields([{name:'tournament_icon'},{name:'tournament_cover'}]),catchAsync(tournamentController.createTournament))
router.get('/bracket/:id',tournamentController.fetchBrackets)
router.post('/register/:id',authentication(),catchAsync(tournamentController.registerTournament))



export default router   