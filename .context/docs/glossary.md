---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Type Definitions

All types below are defined in `packages/shared/src/types/`.

### `Product`
Represents a product available for purchase.

```ts
interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  prices: Price[];
  metadata?: Record<string, string>;
}
```

### `Price`
A pricing entry for a product. Amounts are always stored in the smallest currency unit (cents for BRL).

```ts
interface Price {
  id: string;
  productId: string;
  amount: number;       // in cents — e.g., 9990 = R$ 99,90
  currency: Currency;
  type: 'one_time' | 'recurring';
}
```

### `Customer`
A buyer in the system.

```ts
interface Customer {
  id: string;
  name: string;
  email: string;
  address: Address;
}
```

### `Address`
Physical mailing address.

```ts
interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
```

### `PaymentMethod`
A saved payment instrument belonging to a customer.

```ts
interface PaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethodType;
  card?: CardDetails;
}
```

### `CardDetails`
Masked card data returned in responses (never full PAN).

```ts
interface CardDetails {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}
```

### `CheckoutSession`
The top-level entity representing a buyer's intent to purchase.

```ts
interface CheckoutSession {
  id: string;
  customerId?: string;
  lineItems: LineItem[];
  status: CheckoutSessionStatus;
  paymentMethodTypes: PaymentMethodType[];
  amountTotal: number;   // sum of line items in cents
  currency: Currency;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}
```

### `LineItem`
A product + quantity snapshot within a checkout session.

```ts
interface LineItem {
  id: string;
  sessionId: string;
  productId: string;
  priceId: string;
  quantity: number;
  amountTotal: number;  // price * quantity in cents
}
```

### `Payment`
A payment record created when a checkout session is submitted.

```ts
interface Payment {
  id: string;
  sessionId: string;
  paymentMethodId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: string;
}
```

### `CreateCheckoutSessionDto`
Input DTO for `POST /checkout/sessions`.

```ts
interface CreateCheckoutSessionDto {
  lineItems: { priceId: string; quantity: number }[];
  paymentMethodTypes: PaymentMethodType[];
  customerId?: string;
}
```

### `ProcessPaymentDto`
Input DTO for `POST /checkout/sessions/:id/pay`.

```ts
interface ProcessPaymentDto {
  paymentMethodId: string;
}
```

### `ApiResponse<T>`
Standard response envelope used by all API endpoints.

```ts
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
```

## Enumerations

### `Currency`
```ts
enum Currency {
  BRL = 'BRL',
}
```
Only Brazilian Real is supported. All amounts are in centavos (cents).

### `PaymentMethodType`
```ts
enum PaymentMethodType {
  card = 'card',
  boleto = 'boleto',
  pix = 'pix',
}
```
Reflects the Brazilian payment ecosystem. `boleto` is a bank slip payment method; `pix` is the Brazilian instant payment rail.

### `CheckoutSessionStatus`
```ts
enum CheckoutSessionStatus {
  open = 'open',
  complete = 'complete',
  expired = 'expired',
}
```

## Core Terms

| Term | Definition |
|---|---|
| Checkout Session | A transient record that tracks a buyer's cart and payment intent. Equivalent to a "shopping cart + order" combined. |
| Line Item | A single product-price-quantity entry within a checkout session. |
| Payment Method | An instrument used to pay: card, boleto, or pix. |
| Boleto | A Brazilian bank slip. Buyer prints or pays digitally via banking app. |
| Pix | Brazil's central bank instant payment system. Near-instant transfer via QR code or key. |
| Gateway | In this project, the API Gateway (port 3000) that proxies frontend requests. Not a payment gateway. |
| Use Case | A single application-layer class that encapsulates one business operation. |
| Repository | An interface (domain) and its SQLite implementation (infrastructure) that abstracts data access. |
| Mapper | An infrastructure-layer class that converts raw SQLite row objects into domain entities. |

## Domain Rules

- All monetary amounts are stored and transmitted in the **smallest currency unit** (centavos for BRL). Display formatting is the responsibility of the frontend.
- The only supported currency is **BRL**.
- A checkout session must have at least one line item.
- A session in `complete` or `expired` status cannot be paid again.
- Card details stored in `CardDetails` are always masked — only `last4` digits are exposed.
