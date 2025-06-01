

import type {Router as IRouter} from 'express';
import Router from 'express'
import gearController from '../controller/gear.controller';
import { catchAsync } from '../utils/catchAsync.utils';
import { gearImagesUpload } from '../middleware/multer.middleware';
import { authentication } from '../middleware/authentication.middleware'

const router:IRouter=Router()
router.post('/create',gearImagesUpload.fields([{name:'image'}]),catchAsync(gearController.createGear))
router.patch('/update-gear/:id',gearImagesUpload.fields([{name:'image'}]),catchAsync(gearController.updateGear))
router.use(authentication());
router.delete('/delete-gear/:id',(gearController.deleteGear))

router.post('/add-to-cart',catchAsync(gearController.addToCart));
router.get('/get-cart',catchAsync(gearController.getCart));
router.delete('/delete-cart/:gearId',catchAsync(gearController.removeCart));
router.post('/addOrders',catchAsync(gearController.placeOrder))
router.get('/getOrders',catchAsync(gearController.listOrder));
router.patch(
  '/update-cart/:gearId',
  catchAsync(gearController.updateCartQuantity)
);

export default router