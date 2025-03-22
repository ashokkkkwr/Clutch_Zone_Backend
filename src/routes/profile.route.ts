import type{Router as IRouter} from 'express'   
import Router from 'express'    
import {getProfile} from '../controller/profile.controller'  
import {catchAsync} from '../utils/catchAsync.utils'    
import {tournamentImagesUpload} from '../middleware/multer.middleware'
import { authentication } from '../middleware/authentication.middleware'
const router:IRouter=Router()   

router.get('/',authentication(),catchAsync(getProfile))



export default router   