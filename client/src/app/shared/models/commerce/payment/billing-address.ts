export interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string; // ISO 3166-1 alpha-2 — drives Stripe vs. Paymob routing server-side
  city: string;
  street: string;
}