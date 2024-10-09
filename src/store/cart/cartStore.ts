import { CartItem } from '@/types/cartType';
import { create } from 'zustand';
import {
  calculateTotal,
  getCartFromLocalStorage,
  resetCartAtLocalStorage,
  setCartToLocalStorage,
} from './cartUtils';

interface CartState {
  cart: CartItem[];
  totalCount: number;
  totalPrice: number;
}

const initialState: CartState = {
  cart: [],
  totalCount: 0,
  totalPrice: 0,
};

interface IItem {
  item: CartItem;
  userId: string;
  count: number;
}

interface IRemoveItem {
  itemId: string;
  userId: string;
}

interface IChangeItem {
  itemId: string;
  count: number;
  userId: string;
}

interface CartActions {
  initCart: (payload: string) => void;
  resetCart: (payload: string) => void;
  addCartItem: (payload: IItem) => void;
  removeCartItem: (payload: IRemoveItem) => void;
  changeCartItemCount: (payload: IChangeItem) => void;
}

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  ...initialState,
  initCart: (payload: string) => {
    const userId = payload;
    if (!userId) return;
    const prevCartItems = getCartFromLocalStorage(userId);
    const total = calculateTotal(prevCartItems);
    set(() => ({
      cart: prevCartItems,
      totalCount: total.totalCount,
      totalPrice: total.totalPrice,
    }));
  },
  resetCart: (payload: string) => {
    const userId = payload;
    resetCartAtLocalStorage(userId);
    set(() => ({
      cart: [],
      totalCount: 0,
      totalPrice: 0,
    }));
  },
  addCartItem: (payload: IItem) => {
    const { item, userId, count } = payload;
    set((state) => {
      const isExist = state.cart.some((cartItem) => cartItem.id === item.id);
      if (isExist) {
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, count: cartItem.count + count }
              : cartItem
          ),
        };
      } else {
        return {
          cart: [...state.cart, { ...item, count: count }],
        };
      }
    });
    const total = calculateTotal(get().cart);
    set((state) => ({
      totalCount: total.totalCount,
      totalPrice: total.totalPrice,
    }));
    setCartToLocalStorage(get().cart, userId);
  },
  removeCartItem: (payload: IRemoveItem) => {
    const { itemId, userId } = payload;
    set((state) => ({
      cart: state.cart.filter((cartItem) => cartItem.id !== itemId),
    }));
    const total = calculateTotal(get().cart);
    set((state) => ({
      totalCount: total.totalCount,
      totalPrice: total.totalPrice,
    }));
    setCartToLocalStorage(get().cart, userId);
  },
  changeCartItemCount: (payload: IChangeItem) => {
    const { itemId, count, userId } = payload;

    set((state) => {
      const isExist = state.cart.some((cartItem) => cartItem.id === itemId);
      if (isExist) {
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.id === itemId
              ? {
                  ...cartItem,
                  count: count,
                }
              : cartItem
          ),
        };
      } else {
        return {
          cart: [...state.cart],
        };
      }
    });
    const total = calculateTotal(get().cart);
    set((state) => ({
      totalCount: total.totalCount,
      totalPrice: total.totalPrice,
    }));
    setCartToLocalStorage(get().cart, userId);
  },
}));
