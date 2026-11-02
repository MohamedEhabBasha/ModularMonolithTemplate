import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product } from '../../../../shared/models/commerce/products/product';

export const PendingProductsActions = createActionGroup({
  source: 'Pending Products',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ products: Product[] }>(),
    'Load Failure': props<{ error: string }>(),

    Approve: props<{ id: number }>(),
    'Approve Success': props<{ id: number }>(),
    'Approve Failure': props<{ error: string }>(),

    Reject: props<{ id: number; reason: string }>(),
    'Reject Success': props<{ id: number }>(),
    'Reject Failure': props<{ error: string }>(),
  },
});
