import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Request,Response } from 'express';
import gearService from '../services/gear.service';
class GearController{
    async createGear(req:Request,res:Response){
        const {name,description,price,stock} = req.body
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const image=files?.['image']
        ?files['image'][0].path
        :null;

        const service = await gearService.createGear(name,description,price,stock,image as string)
        res.status(200).json({Message:'successfully added gear',data:service})
    }
}
export default new GearController()