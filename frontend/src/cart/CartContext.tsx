import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number;
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

const LS_CART = "cart_items";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_CART);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(items));
  }, [items]);

  const addItem: CartCtx["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((x) => x.productId === item.productId);
      if (found) {
        return prev.map((x) =>
          x.productId === item.productId
            ? { ...x, quantity: x.quantity + qty }
            : x
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeItem: CartCtx["removeItem"] = (productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  };

  const setQuantity: CartCtx["setQuantity"] = (productId, quantity) => {
    const q = Math.max(1, Math.floor(quantity || 1));
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity: q } : x))
    );
  };

  const clear = () => setItems([]);

  const count = useMemo(
    () => items.reduce((acc, x) => acc + x.quantity, 0),
    [items]
  );
  const total = useMemo(
    () => items.reduce((acc, x) => acc + x.price * x.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, total, addItem, removeItem, setQuantity, clear }),
    [items, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
