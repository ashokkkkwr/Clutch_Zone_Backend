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
      console.log('first');
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
      console.log('🚀 ~ PaymentService ~ esewaPayment ~ secretKey:', secretKey);
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(signatureData)
        .digest('base64');
      console.log('ya saman');
      console.log('🚀 ~ UserService ~ esewaPayment ~ paymentUrl:', DotenvConfig.ESEWA_PAYMENT_URL);

      return {
        paymentUrl: DotenvConfig.ESEWA_PAYMENT_URL,
        params: {...params, signature},
      };
    } catch (error) {
      console.log('🚀 ~ UserService ~ esewaPayment ~ error:', error);
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
  async createBucks(
    amount: string,
    price: string,
    description: string,
    userId: string,
    buckImage: string,
    bonus:string
  ) {
    console.log('🚀 ~ PaymentService ~ createBucks ~ userId:', userId);
    console.log('🚀 ~ PaymentService ~ createBucks ~ description:', description);
    console.log('🚀 ~ PaymentService ~ createBucks ~ amount:', amount);
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });
    if (user?.role !== 'admin') {
      console.log('yua??');
      throw new Error('Must be admin to perform this action.');
    }
    console.log('ya saman??');
    const create = await prisma.payment_bucks.create({
      data: {
        amount: Number(amount),
        price: Number(price),
        description,
        buckImage,
        bonus:Number(bonus)
      },
    });
    return create;
  }
  async getClutchBucks(){
    const bucksLists= await prisma.payment_bucks.findMany()
    console.log("🚀 ~ PaymentService ~ getClutchBucks ~ bucksLists:", bucksLists)
    return bucksLists
    
  }
  async updateAmount(paymentId: string, user_id: string) {
    console.log("🚀 ~ PaymentService ~ updateAmount ~ user_id:", user_id)
    console.log("🚀 ~ PaymentService ~ updateAmount ~ paymentId:", paymentId)
    const find = await prisma.payment_bucks.findFirst({
      where: {
        id: Number(paymentId),
      },
    });
    console.log("🚀 ~ PaymentService ~ updateAmount ~ find:", find)
  
    if (!find) {
      throw new Error("Payment not found");
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
  
  
}
export default new PaymentService();
