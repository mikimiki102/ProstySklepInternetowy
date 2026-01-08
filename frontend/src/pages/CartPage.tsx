import { useMemo, useState } from "react";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, total, setQuantity, removeItem, clear } = useCart();
  const { user, accessToken } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const totalFmt = useMemo(() => total.toFixed(2), [total]);

  const placeOrder = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const body = {
        items: items.map((x) => ({
          productId: x.productId,
          title: x.title,
          price: x.price,
          quantity: x.quantity,
        })),
      };
      const order = await api.orders.create(accessToken, body);
      clear();
      nav(`/orders/${order.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1 style={{ margin: 0 }}>Koszyk</h1>

      {items.length === 0 ? (
        <div className="card">
          <p>Koszyk jest pusty.</p>
          <Link to="/products">Przejdź do produktów</Link>
        </div>
      ) : (
        <>
          <div className="grid" style={{ gap: 12 }}>
            {items.map((x) => (
              <div key={x.productId} className="card">
                <div
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div style={{ minWidth: 260 }}>
                    <strong>{x.title}</strong>
                    <div className="muted">{x.price.toFixed(2)} $</div>
                  </div>

                  <div className="row">
                    <label className="muted">Ilość</label>
                    <input
                      style={{
                        width: 90,
                        padding: 8,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                      }}
                      type="number"
                      min={1}
                      value={x.quantity}
                      onChange={(e) =>
                        setQuantity(x.productId, Number(e.target.value))
                      }
                    />
                    <button
                      className="btn"
                      onClick={() => removeItem(x.productId)}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>Suma</strong>
              <strong>{totalFmt} $</strong>
            </div>

            {!user ? (
              <p style={{ marginTop: 12 }}>
                Aby złożyć zamówienie, musisz się{" "}
                <Link to="/login">zalogować</Link>.
              </p>
            ) : (
              <button
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                disabled={loading || items.length === 0}
                onClick={placeOrder}
              >
                {loading ? "Składanie..." : "Złóż zamówienie"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
