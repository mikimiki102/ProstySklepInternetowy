import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type Order } from "../api/api";
import { useAuth } from "../auth/AuthContext";

export default function OrderDetails() {
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setErr(null);
      setOrder(null);
      if (!accessToken || !id) return;

      setLoading(true);
      try {
        const data = await api.orders.getOne(accessToken, id);
        setOrder(data);
      } catch (e: any) {
        setErr(e?.message ?? "Błąd");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [accessToken, id]);

  if (!user) {
    return (
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Szczegóły zamówienia</h1>
        <p>
          Musisz się <Link to="/login">zalogować</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Szczegóły zamówienia</h1>
        <Link to="/orders">← Wróć</Link>
      </div>

      {loading && <div className="card">Ładowanie...</div>}
      {err && <div className="card">Błąd: {err}</div>}

      {order && (
        <>
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>#{order.id}</strong>
                <div className="muted">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <strong>{Number(order.total).toFixed(2)} $</strong>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Pozycje</h3>
            <div className="grid" style={{ gap: 10 }}>
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div>
                    <strong>{it.titleSnapshot}</strong>
                    <div className="muted">
                      {Number(it.priceSnapshot).toFixed(2)} $ × {it.quantity}
                    </div>
                  </div>
                  <strong>
                    {(Number(it.priceSnapshot) * it.quantity).toFixed(2)} $
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
