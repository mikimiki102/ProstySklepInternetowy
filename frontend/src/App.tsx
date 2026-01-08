import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import CartPage from "./pages/CartPage";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import { useCart } from "./cart/CartContext";
import { useAuth } from "./auth/AuthContext";

function Layout({ children }: { children: React.ReactNode }) {
  const { count } = useCart();
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="navbar">
        <div className="row">
          <strong>Sklep</strong>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart ({count})</Link>
            <Link to="/orders">Orders</Link>
          </div>
        </div>

        <div className="row">
          {user ? (
            <>
              <span className="muted">
                {user.name} ({user.role})
              </span>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>

      <div style={{ padding: "18px 0 40px" }}>{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
      </Routes>
    </Layout>
  );
}
