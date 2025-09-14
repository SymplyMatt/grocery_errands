import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export const initializeTransaction = async (
  email: string,
  amount: number,
  metadata: any,
  callbackUrl: string 
) => {
  try {
    const params = {
      email,
      amount: amount * 100, 
      currency: 'NGN',
      metadata,
      callback_url: callbackUrl 
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      params,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
