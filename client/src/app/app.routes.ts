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

export const routes: Routes = [
  { path: 'shop', component: ShopComponent },
  { path: 'shop/product/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, emptyCartGuard] },
  { path: 'checkout/confirmation', component: ConfirmationStepComponent, canActivate: [authGuard] },
  { path: 'account/register', component: RegisterComponent },
  { path: 'account/login', component: LoginComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent },
];
