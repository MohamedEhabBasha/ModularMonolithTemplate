import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { AccountService } from '../../../core/services/identity/account';
import { AccountRoles } from '../../../shared/models/identity/account-roles';
import { EditSellerComponent } from "./edit-seller/edit-seller.component";
import { EditBuyerComponent } from "./edit-buyer/edit-buyer.component";

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule, MatExpansionModule, EditSellerComponent, EditBuyerComponent],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css',
})
export class EditProfileComponent {
  private accountService = inject(AccountService);
  private accountRoles = AccountRoles;

  protected isSeller = computed(() =>
    this.accountService.currentUser()?.roles.includes(this.accountRoles.Seller),
  );
}
