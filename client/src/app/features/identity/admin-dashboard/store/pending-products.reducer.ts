import { createFeature, createReducer, on } from '@ngrx/store';
import { PendingProductsActions } from './pending-products.actions';
import { initialState } from './pending-products.state';

export const pendingProductsFeature = createFeature({
  name: 'pendingProducts',
  reducer: createReducer(
    initialState,

    // Load
    on(PendingProductsActions.load, (state) => ({
      ...state,
      loading: true,
      loadError: null,
    })),
    on(PendingProductsActions.loadSuccess, (state, { products }) => ({
      ...state,
      products,
      loading: false,
    })),
    on(PendingProductsActions.loadFailure, (state, { error }) => ({
      ...state,
      loading: false,
      loadError: error,
    })),

    // Approve / Reject: same state transitions, so they share handlers
    on(PendingProductsActions.approve, PendingProductsActions.reject, (state, { id }) => ({
      ...state,
      actioningId: id,
      actionError: null,
    })),
    on(
      PendingProductsActions.approveSuccess,
      PendingProductsActions.rejectSuccess,
      (state, { id }) => ({
        ...state,
        products: state.products.filter((p) => p.id !== id),
        actioningId: null,
      }),
    ),
    on(
      PendingProductsActions.approveFailure,
      PendingProductsActions.rejectFailure,
      (state, { error }) => ({
        ...state,
        actioningId: null,
        actionError: error,
      }),
    ),
  ),
});
