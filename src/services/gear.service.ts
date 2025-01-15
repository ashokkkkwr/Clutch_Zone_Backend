import HttpException from "../utils/HttpException.utils";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

class GearService{
    async createGear(name:string,description:string,price:string,stock:string,image:string){
        if(!name || !description || !price || !stock || !image){
            throw HttpException.badRequest('Fields Empty')
        }
        const exists = await prisma.gear.findFirst({
            where:{
                name
            }
        })
        if(exists){
            throw HttpException.conflict('Gear already exists');
        }
        const newGear=await prisma.gear.create({
            data:{
                name,
                price:parseInt(price),
                stock:parseInt(stock),
                description,
                image
            }
        })
        return newGear
    }
    async getGear(){
        const gear = await prisma.gear.findMany();
        return gear
    }
}
export default new GearService()