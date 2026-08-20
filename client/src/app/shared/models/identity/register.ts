export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: AccountType;
}

export type AccountType = 'Buyer' | 'Seller';
