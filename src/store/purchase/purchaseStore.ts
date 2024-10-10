import { create } from 'zustand';

interface PurchaseState {
  purchase: { isLoading: boolean; error: unknown };
  purchaseStart: () => void;
  purchaseSuccess: () => void;
  purchaseFailure: (payload: string) => void;
}

interface PurchaseAction {}

const initialState = {
  isLoading: false,
  error: null,
};

export const usePurchaseStore = create<PurchaseState & PurchaseAction>(
  (set) => ({
    purchase: initialState,
    purchaseStart: () => {
      set((state) => ({ purchase: { isLoading: true, error: null } }));
    },
    purchaseSuccess: () => {
      set((state) => ({ purchase: { isLoading: false, error: null } }));
    },
    purchaseFailure: (payload: string) => {
      set((state) => ({ purchase: { isLoading: false, error: payload } }));
    },
  })
);
