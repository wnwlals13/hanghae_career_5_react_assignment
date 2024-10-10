import {
  IProduct,
  NewProductDTO,
  PaginatedProductsDTO,
} from '@/api/dtos/productDTO';
import { loadProducts } from '@/store/product/productsActions';
import { create } from 'zustand';
import { ProductFilter, ProductSliceState } from '@/types/productType';
import { addProductAPI, fetchProducts } from '@/api/product';

interface LoadProductsProps {
  filter: ProductFilter;
  pageSize: number;
  page: number;
  isInitial: boolean;
}

interface ProductState {
  products: ProductSliceState;
  loadProductsStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  loadProductsError: string | null;
  loadProducts: ({
    filter,
    pageSize,
    page,
    isInitial,
  }: LoadProductsProps) => Promise<void>;
  addProductStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  addProductError: string | null;
  addProduct: (productData: NewProductDTO) => Promise<void>;
}

interface ProductAction {}

const initialState: ProductSliceState = {
  items: [],
  hasNextPage: true,
  isLoading: false,
  error: null,
  totalCount: 0,
};

export const useProductStore = create<ProductState & ProductAction>(
  (set, get) => ({
    products: initialState,
    loadProductsStatus: 'idle',
    loadProductsError: null,
    addProductStatus: 'idle',
    addProductError: null,

    // selectHasNextPage: () => get().products.hasNextPage,

    loadProducts: async ({
      filter,
      pageSize,
      page,
      isInitial,
    }: LoadProductsProps) => {
      set((state) => ({
        products: { ...state.products, isLoading: true },
        loadProductsStatus: 'pending',
      }));
      try {
        const result = await fetchProducts(filter, pageSize, page);
        // console.log('product result =>', result);
        set((state) => ({
          products: {
            ...state.products,
            items: isInitial
              ? result.products
              : [...state.products.items, ...result.products],
            hasNextPage: result.hasNextPage,
            totalCount: result.totalCount,
            isLoading: false,
            error: null,
          },
          loadProductsStatus: 'succeeded',
        }));
        // console.log('loadProducts =>', get().products);
      } catch (error) {}
    },
    addProduct: async (productData: NewProductDTO) => {
      set((state) => ({
        products: { ...state.products, isLoading: true },
        loadProductsStatus: 'pending',
      }));
      try {
        const newProduct: IProduct = await addProductAPI(productData);
        set((state) => ({
          products: {
            ...state.products,
            items: [newProduct].concat(state.products.items),
            totalCount: state.products.totalCount + 1,
            isLoading: false,
            error: null,
          },
        }));
      } catch (error) {}
    },
  })
);
