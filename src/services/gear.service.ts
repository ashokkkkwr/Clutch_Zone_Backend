import { PrismaClient } from "@prisma/client";
import HttpException from "../utils/HttpException.utils";

const prisma = new PrismaClient();

class GearService {
  static async createGear(
    name: string,
    description: string,
    price: string,
    stock: string,
    image: string
  ) {
    // Validate inputs
    if (!name || !description || !price || !stock || !image) {
      throw HttpException.badRequest("Fields Empty");
    }

    // Check for existing gear
    try {
      const exists = await prisma.gear.findFirst({ where: { name } });
      if (exists) {
        throw HttpException.conflict("Gear already exists");
      }
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw HttpException.internalServerError("Internal server error");
    }

    // Create new gear
    try {
      const newGear = await prisma.gear.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          image,
        },
      });
      return newGear;
    } catch (error) {
      throw HttpException.internalServerError("Internal server error");
    }
  }

  static async getGear() {
    try {
      const gears = await prisma.gear.findMany();
      return gears;
    } catch (error) {
      throw HttpException.internalServerError("Internal server error");
    }
  }

  static async updateGears(
    id: string,
    name: string,
    description: string,
    price: string,
    stock: string,
    image: string
  ) {
    const gearId = parseInt(id, 10);

    // Check that gear exists
    let existing;
    try {
      existing = await prisma.gear.findFirst({ where: { id: gearId } });
    } catch (error) {
      throw HttpException.internalServerError("Internal server error");
    }

    if (!existing) {
      throw HttpException.conflict("Gear does not exists");
    }

    // Perform update
    try {
      const updated = await prisma.gear.update({
        where: { id: gearId },
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          image,
        },
      });
      return updated;
    } catch (error) {
      throw HttpException.internalServerError("Internal server error");
    }
  }

static  async addToCart(userId: number, gearId: number, qty: number = 1) {
    // ensure gear exists and enough stock
    const gear = await prisma.gear.findUnique({ where: { id: gearId } });
    if (!gear) throw HttpException.notFound("Gear not found");
    if (gear.stock < qty) throw HttpException.badRequest("Insufficient stock");

    // upsert cart item
    return prisma.cartItem.upsert({
      where: { userId_gearId: { userId, gearId } },
      update: { quantity: { increment: qty } },
      create: { userId, gearId, quantity: qty },
    });
  }
 static async removeFromCart(userId: number, gearId: number) {
    await prisma.cartItem.deleteMany({
      where: { userId, gearId },
    });
  }
 static async getCart(userId: number) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { gear: true },
    });
  }
 static async clearCart(userId: number) {
    await prisma.cartItem.deleteMany({ where: { userId } });
  }


  //orders




static async placeOrder(userId: number) {
  // 1. Load user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw HttpException.notFound("User not found");
  }

  // 2. Load cart items + compute total & prepare orderItems
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { gear: true },
  });
  if (cartItems.length === 0) {
    throw HttpException.badRequest("Cart is empty");
  }

  let total = 0;
  const orderItems = cartItems.map(ci => {
    const unitPrice = ci.gear.price;
    total += unitPrice * ci.quantity;
    return {
      gearId: ci.gearId,
      quantity: ci.quantity,
      unitPrice,
    };
  });

  // 3. Check clutch bucks balance
  if (user.clutch_bucks < total) {
    throw HttpException.badRequest("Insufficient clutch bucks");
  }

  // 4. Everything in one transaction
  const order = await prisma.$transaction(async tx => {
    // 4a. Create the order + items
    const o = await tx.order.create({
      data: {
        userId,
        totalPrice: total,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // 4b. Decrement gear stock
    for (const ci of cartItems) {
      await tx.gear.update({
        where: { id: ci.gearId },
        data: { stock: { decrement: ci.quantity } },
      });
    }

    // 4c. Clear the cart
    await tx.cartItem.deleteMany({ where: { userId } });

    // 4d. Deduct clutch bucks from user
    await tx.user.update({
      where: { id: userId },
      data: { clutch_bucks: { decrement: total } },
    });

    return o;
  });

  return order;
}

 static async getOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { gear: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
  static async updateCartQuantity(
    userId: number,
    gearId: number,
    quantity: number
  ) {
    // ensure cart item exists
    const cartItem = await prisma.cartItem.findUnique({
      where: { userId_gearId: { userId, gearId } },
      include: { gear: true },
    });

    if (!cartItem) {
      throw HttpException.notFound('Cart item not found');
    }

    // ensure sufficient stock
    const availableStock = cartItem.gear.stock;
    if (availableStock < quantity) {
      throw HttpException.badRequest('Insufficient stock');
    }

    // update quantity
    const updated = await prisma.cartItem.update({
      where: { userId_gearId: { userId, gearId } },
      data: { quantity },
      include: { gear: true },
    });

    return updated;
  }
  static async deleteGears(id: string) {
    try{
 const gearId = parseInt(id, 10);
 console.log("🚀 ~ GearService ~ deleteGears ~ gearId:", gearId)

    // Check that gear exiPsts
    let existing;
    try {
      existing = await prisma.gear.findFirst({ where: { id: gearId } });
    } catch (error) {
      throw HttpException.internalServerError("Internal server error");
    }
    console.log("🚀 ~ GearService ~ deleteGears ~ existing:", existing)

    if (!existing) {
          console.log("🚀 ~ GearService ~ deleteGears ~ existing:", existing)

      throw HttpException.conflict("Gear does not exists");
    }
console.log('pugo')
    // Perform delete
    try {
      const deleted = await prisma.gear.delete({
        where: { id: gearId },
      });
      console.log("🚀 ~ GearService ~ deleteGears ~ deleted:", deleted)
      return deleted;
    } catch (error) {
      throw HttpException.internalServerError("Internal server error");
    }
    }catch(error:any){
      console.log("🚀 ~ GearService ~ deleteGears ~ error:", error)
      throw HttpException.internalServerError("Internal server error");
    }
   
  }

}

export default GearService;
