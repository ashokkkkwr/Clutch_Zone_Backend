import {Message} from '../constant/messages';
import HttpException from '../utils/HttpException.utils';
import BcryptService from '../utils/bcryptService';
import {transferImageFromUploadToTemp} from '../utils/path.utils';
import {createToken, verifyToken} from '../utils/tokenManager';
import {DotenvConfig} from '../config/env.config';
import {addMinutes} from 'date-fns';
import {randomInt} from 'crypto';
import {accountActivationMail} from '../utils/mail.template';
import {PrismaClient} from '@prisma/client';
import webTokenService from '../utils/webToken.service';
import {Role} from '../constant/enum';
import {v4 as uuidv4} from 'uuid';
import crypto from 'crypto';

import axios from 'axios';
const prisma = new PrismaClient();

class PaymentService {
  async esewaPayment(userId: string, tournamentId: string) {
    try {
     
      const tournament = await prisma.tournament.findUnique({
        where: {
          id: parseInt(tournamentId),
        },
      });
      if (!tournament) throw new Error('Tournament not found');
      if (!tournament.tournament_entry_fee) throw new Error('No entry fee required');
      //Generate Payment Parameters
      const transactionUuid = uuidv4();
      // In UserService's esewaPayment function
      const params = {
        amount: tournament.tournament_entry_fee.toFixed(2),
        tax_amount: '0.00',
        total_amount: tournament.tournament_entry_fee.toFixed(2),
        transaction_uuid: transactionUuid, // Corrected parameter name
        product_code: DotenvConfig.ESEWA_PRODUCT_CODE,
        success_url: `${DotenvConfig.FRONTEND_URL}/payment-success?tournamentId=${tournamentId}`,
        failure_url: `${DotenvConfig.FRONTEND_URL}/payment-failure`,
        signed_field_names: `total_amount=${tournament.tournament_entry_fee.toFixed(
          2,
        )},transaction_uuid=${transactionUuid},product_code=EPAYTEST`,
      };

      // Generate signature with correct field order and names
      const signatureData = [
        `total_amount=${params.total_amount}`,
        `transaction_uuid=${params.transaction_uuid}`,
        `product_code=${params.product_code}`,
      ].join(',');

      const secretKey = DotenvConfig.ESEWA_SECRET_KEY ?? '';
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(signatureData)
        .digest('base64');
  
      return {
        paymentUrl: DotenvConfig.ESEWA_PAYMENT_URL,
        params: {...params, signature},
      };
    } catch (error) {
      throw new Error('Failed to initiate payment');
    }
  }
  async verifivcationResponse(userId: string, input: any) {
    const verificationURL = DotenvConfig.ESEWA_VERIFICATION_URL ?? '';
    const verification = await axios.post(verificationURL, {
      merchant_id: DotenvConfig.ESEWA_MERCHANT_ID,
      transaction_uuid: input.transaction_uuid,
      amount: input.amount,
    });
    if (verification.data.status !== 'COMPLETE') {
      throw new Error('Payment verification failed');
    }
    const participant = await prisma.participant.create({
      data: {
        userId: parseInt(userId),
        tournamentId: parseInt(input.tournamentId),
      },
      select: {
        tournament: true,
      },
    });
    return {
      success: true,
      message: 'Registration successful',
      tournament: participant.tournament,
    };
  }

  async updateAmount(paymentId: string, user_id: string) {
    const find = await prisma.payment_bucks.findFirst({
      where: {
        id: Number(paymentId),
      },
    });

    if (!find) {
      throw new Error('Payment not found');
    }

    await prisma.user.update({
      where: {
        id: Number(user_id),
      },
      data: {
        clutch_bucks: {
          increment: find.amount, // Increment the existing value
        },
      },
    });
  }
  async paymentSuccess(data: any, userId: string) {
    try {
      const clutch_bucks = await prisma.payment_bucks.findFirst({
        where: {
          id: Number(data.clutchbuck_id),
        },
      });
      const payment_buck_transaction = await prisma.payment_bucks_transaction.create({
        data: {
          user_id: Number(userId),
          payment_bucks_id: Number(data.clutchbuck_id),
        },
      });
      const user = await prisma.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          clutch_bucks: {
            increment: Number(clutch_bucks?.amount), // Increase the value instead of replacing it
          },
        },
      });
  
    } catch (error) {
      throw new Error('Payment processing failed');
    }
  }
  async createBucks(
    amount: string,
    price: string,
    description: string,
    userId: string,
    buckImage: string,
    bonus: string,
  ) {
    try {
      console.log('ya aipugo?')
    
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });
      console.log("🚀 ~ PaymentService ~ user:", user)
      if (user?.role !== 'ADMIN') {
        throw new Error('Must be admin to perform this action.');
      }
      const create = await prisma.payment_bucks.create({
        data: {
          amount: Number(amount),
          price: Number(price),
          description,
          buckImage,
          bonus: Number(bonus),
        },
      });
      console.log("🚀 ~ PaymentService ~ create:", create)
      return create;
    } catch (error) {

      }
  }
  async getClutchBucks() {
    const bucksLists = await prisma.payment_bucks.findMany();
    return bucksLists;
  }
  async updateBucksPackage(
    id: string,
    data: {
      amount?: number | string;
      price?: number | string;
      description?: string;
      bonus?: number | string;
      buckImage?: string;
    }
  ) {
    const updateData: Record<string, any> = {};

    if (data.amount !== undefined) updateData.amount = Number(data.amount);
    if (data.price !== undefined)  updateData.price = Number(data.price);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.bonus !== undefined)      updateData.bonus = Number(data.bonus);
    if (data.buckImage)                  updateData.buckImage = data.buckImage;

    return prisma.payment_bucks.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }
}
export default new PaymentService();
