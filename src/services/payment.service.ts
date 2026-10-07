import { apiClient } from './api-client';
import { PaymentRecord } from '@/types';

export interface CreateOrderPayload {
  package_id?: string;
  subscription_plan_id?: string;
  purpose: 'token_purchase' | 'subscription';
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentService = {
  async createOrder(payload: CreateOrderPayload) {
    return apiClient.post<any>('/payments/create-order', payload);
  },

  async verifyPayment(payload: VerifyPaymentPayload) {
    return apiClient.post<any>('/payments/verify', payload);
  },

  async getHistory(): Promise<PaymentRecord[]> {
    return apiClient.get<PaymentRecord[]>('/payments/history');
  },

  async getPaymentDetail(paymentId: string): Promise<PaymentRecord> {
    return apiClient.get<PaymentRecord>(`/payments/${paymentId}`);
  },

  // Helper to load Razorpay Checkout script
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
};
