import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { FilterState } from '../shop.component';

@Component({
  selector: 'app-filter-sidenav',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
  ],
  templateUrl: './filter-sidenav.component.html',
  styleUrl: './filter-sidenav.component.css',
})
export class FilterSidenavComponent {
  allTypes = input.required<string[]>();
  allBrands = input.required<string[]>();

  filtersChange = output<FilterState>();

  searchApply = output<string>();

  filters = signal<FilterState>({ search: '', types: [], brands: [], sort: 'name' });

  searchDraft = signal('');

  private emitChange(patch: Partial<FilterState>): void {
    this.filters.update((f) => ({ ...f, ...patch }));
    this.filtersChange.emit(this.filters());
  }

  onSearchInput(value: string): void {
    this.searchDraft.set(value);
  }

  onSearchSubmit(): void {
    this.filters.update((f) => ({ ...f, search: this.searchDraft() }));
    this.searchApply.emit(this.searchDraft());
  }

  onSortChange(sort: 'name' | 'priceAsc' | 'priceDesc'): void {
    this.emitChange({ sort });
  }

  onTypeToggle(type: string, checked: boolean): void {
    const types = checked
      ? [...this.filters().types, type]
      : this.filters().types.filter((t) => t !== type);
    this.emitChange({ types });
  }

  onBrandToggle(brand: string, checked: boolean): void {
    const brands = checked
      ? [...this.filters().brands, brand]
      : this.filters().brands.filter((b) => b !== brand);
    this.emitChange({ brands });
  }

  clearAll(): void {
    this.searchDraft.set('');
    this.filters.set({ search: '', types: [], brands: [], sort: 'name' });
    this.filtersChange.emit(this.filters());
  }
}
