import type{Router as IRouter} from 'express'   
import Router from 'express'    
import tournamentController from '../controller/tournament.controller'  
import {catchAsync} from '../utils/catchAsync.utils'    
import {tournamentImagesUpload} from '../middleware/multer.middleware'
import { authentication } from '../middleware/authentication.middleware'
import { authorization } from '../middleware/authorization.middleware'
import { Role } from '../constant/enum'
const router:IRouter=Router()   
router.get('/bracket/:id',tournamentController.fetchBrackets)
router.post('/register/:id',authentication(),catchAsync(tournamentController.registerTournament))
router.get('/matches',authentication(),tournamentController.getUserMatches)
router.use(authentication())
router.use(authorization([Role.ADMIN]))
router.post('/create',tournamentImagesUpload.fields([{name:'tournament_icon'},{name:'tournament_cover'}]),catchAsync(tournamentController.createTournament))

export default router