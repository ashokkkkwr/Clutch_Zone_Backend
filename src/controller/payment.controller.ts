import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Request,Response } from 'express';
// import gearService from '../services/gear.service';
import paymentService from '../services/payment.service';
class PaymentController{
    async createBucks(req:Request,res:Response){
         const baseUrl = `${req.protocol}://${req.get('host')}`
        const userId = req.user?.id;
        if(!userId){
            throw new Error('Must be admin to proceed')
        }
        const {amount,price,description,bonus} = req.body
      

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
       // Construct the full URLs for gameCoverImage and gameIcon
       const image = files?.['image']
       ? `${baseUrl}/${files['image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
       : null;
       
        if(!amount || !price || !description ||!userId || !image){
            throw new Error('All fields must be filled')
        }
       
        const service = await paymentService.createBucks(amount,price,description,userId,image as string,bonus)
        res.status(200).json({Message:'successfully added Clutch bucks',data:service})
    }
    
}
export default new PaymentController()