export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  pictureUrl: string | null;
  roles: string[];
  brandName?: string;
  brandNameChangedAt?: string | null;
}
