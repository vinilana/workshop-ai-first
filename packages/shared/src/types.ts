export interface Product {
  id: string;
  name: string;
  description: string;
  active: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: string;
  productId: string;
  unitAmount: number;
  currency: string;
  active: boolean;
  recurring: boolean;
  interval: 'month' | 'year' | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: Address | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: 'card' | 'boleto' | 'pix';
  card?: CardDetails;
  createdAt: string;
}

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface CheckoutSession {
  id: string;
  customerId: string | null;
  customerEmail: string | null;
  status: 'open' | 'complete' | 'expired';
  paymentStatus: 'unpaid' | 'paid' | 'no_payment_required';
  amountTotal: number;
  currency: string;
  lineItems: LineItem[];
  successUrl: string;
  cancelUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface LineItem {
  priceId: string;
  productId: string;
  quantity: number;
  unitAmount: number;
  description: string;
}

export interface Payment {
  id: string;
  checkoutSessionId: string;
  customerId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutSessionDto {
  customerEmail?: string;
  lineItems: { priceId: string; quantity: number }[];
  successUrl: string;
  cancelUrl: string;
}

export interface ProcessPaymentDto {
  checkoutSessionId: string;
  paymentMethodType: 'card' | 'boleto' | 'pix';
  card?: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    holderName: string;
  };
  customer: {
    email: string;
    name: string;
    phone?: string;
    address?: Address;
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
