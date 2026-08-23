import { Component } from '@angular/core';
import { ProfileFieldsComponent } from "../profile-fields/profile-fields.component";

@Component({
  selector: 'app-edit-buyer',
  imports: [ProfileFieldsComponent],
  templateUrl: './edit-buyer.component.html',
  styleUrl: './edit-buyer.component.css',
})
export class EditBuyerComponent {}
