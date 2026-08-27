import { PhotoDto } from "../../photo-dto";
import { ProductStatus } from "./productStatus";

export interface SellerProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  pictures: PhotoDto[];
  type: string;
  brand: string;
  availableQuantity: number;
  status: ProductStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
}