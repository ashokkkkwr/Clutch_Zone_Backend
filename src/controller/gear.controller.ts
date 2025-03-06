import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Request,Response } from 'express';
import gearService from '../services/gear.service';
class GearController{
    async createGear(req:Request,res:Response){
        const baseUrl = `${req.protocol}://${req.get('host')}`

        const {name,description,price,stock} = req.body
        console.log("🚀 ~ GearController ~ createGear ~ name:", name)
        console.log("🚀 ~ GearController ~ createGear ~ stock:", stock)
        console.log("🚀 ~ GearController ~ createGear ~ price:", price)
        console.log("🚀 ~ GearController ~ createGear ~ description:", description)
        const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
    const team_icon = files?.['image']
    ? `${baseUrl}/${files['image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
    : null;

        const service = await gearService.createGear(name,description,price,stock,team_icon as string)
        console.log("🚀 ~ GearController ~ createGear ~ service:", service)
        res.status(200).json({Message:'successfully added gear',data:service})
    }
}
export default new GearController()