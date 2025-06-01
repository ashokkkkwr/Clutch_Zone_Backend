import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Request,Response } from 'express';
import gearService from '../services/gear.service';
class GearController{
    async createGear(req:Request,res:Response){
        const baseUrl = `${req.protocol}://${req.get('host')}`

        const {name,description,price,stock} = req.body
       
        const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
    const team_icon = files?.['image']
    ? `${baseUrl}/${files['image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
    : null;

        const service = await gearService.createGear(name,description,price,stock,team_icon as string)
        res.status(200).json({Message:'successfully added gear',data:service})
    }
    async updateGear(req:Request,res:Response){
        
        console.log('ya xiro?')
        try{

        
        const baseUrl = `${req.protocol}://${req.get('host')}`

        const {name,description,price,stock} = req.body
        const id = req.params.id
        console.log("🚀 ~ GearController ~ updateGear ~ id:", id)
        const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
        const team_icon = files?.['image']
        ? `${baseUrl}/${files['image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
        : null;
        const service = await gearService.updateGears(id,name,description,price,stock,team_icon as string)
        res.status(200).json({Message:'successfully updated gear',data:service})
    }catch(error:any){
        console.log("🚀 ~ GearController ~ updateGear ~ error:", error)
        res.status(400).json({Message:error.message})
    }
    
}
async deleteGear(req:Request,res:Response){
  try{
  const id = req.params.id
    console.log("🚀 ~ GearController ~ deleteGear ~ id:", id)
    const service = await gearService.deleteGears(id)
    res.status(200).json({Message:'successfully deleted gear',data:service})
  }catch(error:any){
    console.log("🚀 ~ GearController ~ deleteGear ~ error:", error)
    res.status(400).json({Message:error.message})
  }
  

  
}


 async addToCart(req: Request, res: Response) {
    const userId = Number(req.user.id);
    const { gearId, quantity } = req.body;
    const item = await gearService.addToCart(userId, Number(gearId), Number(quantity));
    res.json({ message: "Added to cart", item });
  }

async removeCart(req: Request, res: Response) {
    const userId = Number(req.user.id);
    const gearId = Number(req.params.gearId);
    await gearService.removeFromCart(userId, gearId);
    res.json({ message: "Removed from cart" });
  }

async getCart(req: Request, res: Response) {
    const userId = Number(req.user.id);
    console.log("🚀 ~ GearController ~ getCart ~ userId:", userId)
    const items = await gearService.getCart(userId);
    res.json({ cart: items });
  }
  async placeOrder(req: Request, res: Response) {
    const userId = Number(req.user.id);
    console.log("🚀 ~ GearController ~ placeOrder ~ userId:", userId)
    const order = await gearService.placeOrder(userId);
    res.status(201).json({ message: "Order placed", order });
  } 
   async listOrder(req: Request, res: Response) {
    const userId = Number(req.user.id);
    const orders = await gearService.getOrders(userId);
    res.json({ orders });
  }

async updateCartQuantity(req: Request, res: Response) {
    const userId = Number(req.user.id);
    const gearId = Number(req.params.gearId);
    const { quantity } = req.body;

    if (quantity == null || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    const updatedItem = await gearService.updateCartQuantity(
      userId,
      gearId,
      Number(quantity)
    );

    res.json({ message: 'Cart quantity updated', item: updatedItem });
  }

}
export default new GearController()