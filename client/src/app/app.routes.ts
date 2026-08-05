import { Routes } from '@angular/router';
import { ShopComponent } from './features/commerce/shop/shop.component';
import { ProductDetailsComponent } from './features/commerce/shop/product-details/product-details.component';
import { NotFoundComponent } from './shared/errors/not-found/not-found.component';
import { ServerErrorComponent } from './shared/errors/server-error/server-error.component';
import { CartComponent } from './features/commerce/cart/cart.component';
import { CheckoutComponent } from './features/commerce/checkout/checkout.component';

export const routes: Routes = [
  { path: 'shop', component: ShopComponent },
  { path: 'shop/product/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent },
];
