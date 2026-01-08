export type CartItem = {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

const KEY = "cart_v1";

export function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}
