import { Routes } from '@angular/router';
import { ShopComponent } from './features/commerce/shop/shop.component';
import { ProductDetailsComponent } from './features/commerce/shop/product-details/product-details.component';
import { NotFoundComponent } from './shared/errors/not-found/not-found.component';
import { ServerErrorComponent } from './shared/errors/server-error/server-error.component';
import { CartComponent } from './features/commerce/cart/cart.component';
import { CheckoutComponent } from './features/commerce/checkout/checkout.component';
import { RegisterComponent } from './features/identity/register/register.component';
import { LoginComponent } from './features/identity/login/login.component';
import { authGuard } from './core/guards/auth-guard';
import { emptyCartGuard } from './core/guards/commerce/empty-cart-guard';
import { ConfirmationStepComponent } from './features/commerce/checkout/confirmation-step/confirmation-step.component';
import { OrdersComponent } from './features/commerce/orders/orders.component';
import { OrderDetailsComponent } from './features/commerce/orders/order-details/order-details.component';
import { confirmationGuard } from './core/guards/commerce/confirmation-guard';
import { ProfileComponent } from './features/identity/profile/profile.component';
import { EditProfileComponent } from './features/identity/edit-profile/edit-profile.component';
import { SellerProfileComponent } from './features/identity/profile/seller-profile/seller-profile.component';
import { sellerProfileResolver } from './core/resolvers/seller-profile-resolver';
import { AdminDashboardComponent } from './features/identity/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './core/guards/identity/admin-guard';

export const routes: Routes = [
  { path: 'shop', component: ShopComponent },
  { path: 'shop/product/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, emptyCartGuard] },
  {
    path: 'checkout/confirmation',
    component: ConfirmationStepComponent,
    canActivate: [authGuard, confirmationGuard],
  },
  { path: 'account/register', component: RegisterComponent },
  { path: 'account/login', component: LoginComponent },
  { path: 'account/me', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'account/me/edit', component: EditProfileComponent, canActivate: [authGuard] },
  {
    path: 'seller/:id',
    component: SellerProfileComponent,
    resolve: { sellerProfile: sellerProfileResolver },
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent },
];
