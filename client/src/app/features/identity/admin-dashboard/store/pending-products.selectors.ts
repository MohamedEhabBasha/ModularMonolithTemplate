// pending-products.selectors.ts
import { createSelector } from '@ngrx/store';
import { pendingProductsFeature } from './pending-products.reducer';

// createFeature already generates one selector per state property:
export const {
  selectProducts,
  selectLoading,
  selectLoadError,
  selectActioningId,
  selectActionError,
} = pendingProductsFeature;

// Derived selector for the dashboard badge
export const selectPendingCount = createSelector(
  selectProducts,
  (products) => products.length,
);