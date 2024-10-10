import { IProduct, PaginatedProductsDTO } from '@/api/dtos/productDTO';
import { create } from 'zustand';
import { ProductFilter, ProductSliceState } from '@/types/productType';

export interface LoadProductsProps {
  filter: ProductFilter;
  pageSize: number;
  page: number;
  isInitial: boolean;
}

export interface ProductItem {
  products: IProduct[];
  isInitial: boolean;
  hasNextPage: boolean;
  totalCount: number;
}

interface ProductState {
  products: ProductSliceState;
}

interface ProductAction {
  setProducts: (param: PaginatedProductsDTO) => void;
  addProducts: (param: IProduct) => void;
}

const initialState: ProductSliceState = {
  items: [],
  hasNextPage: true,
  isLoading: false,
  error: null,
  totalCount: 0,
};

export const useProductStore = create<ProductState & ProductAction>((set) => ({
  products: initialState,
  setProducts: (param: PaginatedProductsDTO) => {
    console.log('pages', param);
    set((state) => ({
      products: {
        ...state.products,
        items: [...param.products],
        hasNextPage: param.hasNextPage,
        totalCount: param.totalCount,
        isLoading: false,
        error: null,
      },
    }));
  },
  addProducts: (newProduct: IProduct) => {
    set((state) => ({
      products: {
        ...state.products,
        items: [newProduct].concat(state.products.items),
        totalCount: state.products.totalCount + 1,
        isLoading: false,
        error: null,
      },
    }));
  },
}));
