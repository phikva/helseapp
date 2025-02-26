import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,

      addItem: (item) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex((i) => i.id === item.id);

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += item.quantity;

            return {
              items: updatedItems,
              total: calculateTotal(updatedItems),
            };
          }

          const newItems = [...state.items, item];
          return {
            items: newItems,
            total: calculateTotal(newItems),
          };
        }),

      removeItem: (itemId) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: newItems,
            total: calculateTotal(newItems),
          };
        }),

      updateQuantity: (itemId, quantity) =>
        set((state) => {
          const newItems = state.items
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity: Math.max(0, quantity) }
                : item
            )
            .filter((item) => item.quantity > 0);

          return {
            items: newItems,
            total: calculateTotal(newItems),
          };
        }),

      clearCart: () =>
        set({
          items: [],
          total: 0,
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Add a default export for the cart store
const cartStore = { useCartStore };
export default cartStore; 