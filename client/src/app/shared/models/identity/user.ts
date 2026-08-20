export type User = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
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
