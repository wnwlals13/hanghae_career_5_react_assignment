import { ALL_CATEGORY_ID } from '@/constants';
import { ProductFilter } from '@/types/productType';
import { create } from 'zustand';

interface FilterState {
  filter: ProductFilter;
}

interface FilterAction {
  selectFilter: () => ProductFilter;
  setMinPrice: (payload: number) => void;
  setMaxPrice: (payload: number) => void;
  setTitle: (payload: string) => void;
  setCategoryId: (payload: string) => void;
  resetFilter: () => void;
}

const initialState: ProductFilter = {
  minPrice: 0,
  maxPrice: 0,
  title: '',
  categoryId: ALL_CATEGORY_ID,
};

export const useFilterStore = create<FilterState & FilterAction>(
  (set, get) => ({
    filter: initialState,
    selectFilter: () => {
      return get().filter;
    },
    setMinPrice: (payload: number) => {
      set((state) => ({ filter: { ...state.filter, minPrice: payload } }));
    },
    setMaxPrice: (payload: number) => {
      set((state) => ({ filter: { ...state.filter, maxPrice: payload } }));
    },
    setTitle: (payload: string) => {
      set((state) => ({ filter: { ...state.filter, title: payload } }));
    },
    setCategoryId: (payload: string) => {
      set((state) => ({ filter: { ...state.filter, categoryId: payload } }));
    },
    resetFilter: () => {
      set(() => ({ filter: { ...initialState } }));
    },
  })
);
