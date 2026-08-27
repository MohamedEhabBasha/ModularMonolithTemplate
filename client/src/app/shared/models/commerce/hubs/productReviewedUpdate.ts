import { ProductStatus } from "../products/productStatus";

export interface ProductReviewedUpdate {
  productId: number;
  status: ProductStatus;
  rejectionReason: string | null;
  reviewedAt: string;
}