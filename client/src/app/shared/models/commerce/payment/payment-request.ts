import { BillingAddress } from './billing-address';

export interface PaymentRequest {
  cartId: string;
  billingAddress: BillingAddress;
}
