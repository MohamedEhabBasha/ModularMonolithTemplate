import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FilterSidenavComponent, FilterState } from '../filter-sidenav/filter-sidenav.component';
import { MatIcon } from '@angular/material/icon';

export interface FilterDialogData {
  allTypes: string[];
  allBrands: string[];
}

@Component({
  selector: 'app-filter-dialog-mobile',
  imports: [MatIcon, CommonModule, MatDialogModule, FilterSidenavComponent],
  templateUrl: './filter-dialog-mobile.component.html',
  styleUrl: './filter-dialog-mobile.component.css',
})
export class FilterDialogMobileComponent {
   constructor(
    public dialogRef: MatDialogRef<FilterDialogMobileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FilterDialogData
  ) {}


  onFiltersChange(filters: FilterState): void {
    this.dialogRef.close({ type: 'filters', payload: filters });
  }

  onSearchApply(search: string): void {
    this.dialogRef.close({ type: 'search', payload: search });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
