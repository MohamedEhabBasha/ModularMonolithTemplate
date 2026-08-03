import { Routes } from '@angular/router';
import { ShopComponent } from './features/commerce/shop/shop.component';
import { ProductDetailsComponent } from './features/commerce/shop/product-details/product-details.component';

export const routes: Routes = [
    {path: 'shop', component: ShopComponent},
    {path: 'shop/product/:id', component: ProductDetailsComponent},
    {path: '**', redirectTo: 'shop', pathMatch: 'full'},
];
