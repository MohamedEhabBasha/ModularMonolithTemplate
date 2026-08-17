import { BillingAddress } from './payment/billing-address';

export interface Order {
  id: number;
  orderDate: string;
  buyerEmail: string;
  billingAddress: BillingAddress;
  deliveryMethod: string;
  deliveryPrice: number;
  paymentSummary: PaymentSummary;
  orderItems: OrderItem[];
  subtotal: number;
  status: string;
  total: number;
  paymentTransactionId: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface PaymentSummary {
  last4: number;
  brand: string;
  expMonth?: number;
  expYear?: number;
}
