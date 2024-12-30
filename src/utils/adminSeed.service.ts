import {PrismaClient} from '@prisma/client';
import BcryptService from '../utils/bcryptService';
const prisma = new PrismaClient();
class seedAdmin{
async seed() {
try{
 const hash = await BcryptService.hash(process.env.ADMIN_PASSWORD!);
 const adminEmail=process.env.ADMIN_EMAIL!;
 const adminUsername=process.env.ADMIN_USERNAME!;
await prisma.user.upsert({
    where:{email:adminEmail},
    update:{},
    create:{
        username:adminUsername,
        email:adminEmail,
        password:hash,
        role:'admin'    
    }
})
}catch(error){

    console.error("Error seeding admin",error);
}finally{
    await prisma.$disconnect();
}}}
export default new seedAdmin();