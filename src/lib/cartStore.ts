import { create } from 'zustand';

export interface CartItem {
  garmentId: number;
  garmentName: string;
  fabric?: string;
  color?: string;
  customization?: string;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (garmentId: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item: CartItem) => {
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  removeItem: (garmentId: number) => {
    set((state) => ({
      items: state.items.filter((i) => i.garmentId !== garmentId),
    }));
  },

  clear: () => {
    set({ items: [] });
  },

  total: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price, 0);
  },
}));
