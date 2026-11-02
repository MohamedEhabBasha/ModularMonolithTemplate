import { Product } from '../../../../shared/models/commerce/products/product';

export interface PendingProductsState {
  products: Product[];
  loading: boolean;
  loadError: string | null;
  actioningId: number | null;
  actionError: string | null;
}

export const initialState: PendingProductsState = {
  products: [],
  loading: false,
  loadError: null,
  actioningId: null,
  actionError: null,
};
