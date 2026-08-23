import { UserProfileDto } from "../identity/profile";

export interface SellerProfile extends UserProfileDto{
  brandName?: string;
  brandNameChangedAt?: string | null;
}
