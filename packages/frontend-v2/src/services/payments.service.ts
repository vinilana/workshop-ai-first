import { apiRequest } from './api';

export interface PaymentData {
  checkoutSessionId: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  holderName: string;
  email: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  amount: number;
}

export async function processPayment(
  data: PaymentData
): Promise<PaymentResult> {
  const body = {
    checkout_session_id: data.checkoutSessionId,
    customer_email: data.email,
    payment_method: {
      type: 'credit_card',
      card: {
        number: data.cardNumber,
        exp_month: parseInt(data.expMonth, 10),
        exp_year: parseInt(data.expYear, 10),
        cvc: data.cvc,
        holder_name: data.holderName,
      },
    },
  };

  return apiRequest<PaymentResult>('/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
