import { http } from "./http";

export type UserRole = "USER" | "ADMIN";
export type Me = { id: string; email: string; name: string; role: UserRole };

export type LoginRes = { accessToken: string };
export type OrderItemCreate = {
  productId: number;
  title: string;
  price: number;
  quantity: number;
};
export type OrderCreateReq = { items: OrderItemCreate[] };

export type OrderItem = {
  id: string;
  productId: number;
  titleSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  orderId: string;
};

export type Order = {
  id: string;
  total: number;
  createdAt: string;
  userId: string;
  items: OrderItem[];
};

export type Review = {
  id: string;
  productId: number;
  rating: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  email: string;
  user?: { id: string; name: string; email: string; role: UserRole };
};

export const api = {
  auth: {
    register: (body: { email: string; name: string; password: string }) =>
      http<{ id: string; email: string; name: string; role: UserRole }>(
        "/auth/register",
        { method: "POST", json: body }
      ),
    login: (body: { email: string; password: string }) =>
      http<LoginRes>("/auth/login", { method: "POST", json: body }),
    me: (token: string) =>
      http<Me>("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
    refresh: () => http<LoginRes>("/auth/refresh", { method: "POST" }),
    logout: () => http<{ ok: true }>("/auth/logout", { method: "POST" }),
  },

  orders: {
    create: (token: string, body: OrderCreateReq) =>
      http<Order>("/orders", {
        method: "POST",
        json: body,
        headers: { Authorization: `Bearer ${token}` },
      }),
    listMine: (token: string) =>
      http<Order[]>("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getOne: (token: string, id: string) =>
      http<Order>(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  reviews: {
    listForProduct: (productId: number) =>
      http<Review[]>(`/products/${productId}/reviews`),
    create: (
      token: string,
      productId: number,
      body: { rating: number; message: string }
    ) =>
      http<Review>(`/products/${productId}/reviews`, {
        method: "POST",
        json: body,
        headers: { Authorization: `Bearer ${token}` },
      }),
    update: (
      token: string,
      id: string,
      body: { rating: number; message: string }
    ) =>
      http<Review>(`/reviews/${id}`, {
        method: "PUT",
        json: body,
        headers: { Authorization: `Bearer ${token}` },
      }),
    remove: (token: string, id: string) =>
      http<{ ok: true }>(`/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
};
