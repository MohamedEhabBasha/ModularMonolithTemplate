import { nanoid } from 'nanoid';

export type CartItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  pictureUrl: string;
  brand: string;
  type: string;
};

export type CartType = {
  id: string;
  items: CartItem[];
  deliveryMethodId?: number;
  paymentReference?: string;
  clientToken?: string;
  redirectUrl?: string;
  couponCode?: string | null;
  discount?: number;
};

export class Cart implements CartType {
  id = nanoid();
  items: CartItem[] = [];
  deliveryMethodId?: number;
  paymentReference?: string;
  clientToken?: string;
  redirectUrl?: string;
  couponCode?: string | null;
  discount?: number;
}
