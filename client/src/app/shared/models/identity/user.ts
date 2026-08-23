export type User = {
  id: string
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  pictureUrl?: string;
  address: Address;
  roles: string[];
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  country: string;
  state?: string;
  postalCode?: string;
};

export interface PhotoDto {
  url: string;
}
export interface UpdateBasicInfoDto {
  firstName: string;
  lastName: string;
}
export interface UpdateBrandNameDto {
  brandName: string;
}
