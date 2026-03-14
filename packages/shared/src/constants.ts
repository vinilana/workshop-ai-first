export const API_CORE_PORT = 3001;
export const API_PORT = 3002;
export const GATEWAY_PORT = 3000;
export const FRONTEND_V1_PORT = 5173;
export const FRONTEND_V2_PORT = 5174;

export const CURRENCIES = ['brl', 'usd'] as const;
export type Currency = typeof CURRENCIES[number];

export const PAYMENT_METHODS = ['card', 'boleto', 'pix'] as const;
export type PaymentMethodType = typeof PAYMENT_METHODS[number];

export const CHECKOUT_SESSION_EXPIRY_MINUTES = 30;

export const DB_PATH = '../../data/dom-pagamentos.sqlite';
