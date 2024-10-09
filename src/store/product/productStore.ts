import { create } from 'zustand';
import { ProductSliceState } from '@/types/productType';

const initialState: ProductSliceState = {
  items: [],
  hasNextPage: true,
  isLoading: false,
  error: null,
  totalCount: 0,
};

const useProductStore = create((set) => ({}));
