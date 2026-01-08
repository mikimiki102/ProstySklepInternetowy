import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Order } from "../api/api";
import { useAuth } from "../auth/AuthContext";

export default function Orders() {
  const { user, accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setErr(null);
      if (!accessToken) return;
      setLoading(true);
      try {
        const list = await api.orders.listMine(accessToken);
        setOrders(list);
      } catch (e: any) {
        setErr(e?.message ?? "Błąd");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [accessToken]);

  if (!user) {
    return (
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Zamówienia</h1>
        <p>
          Żeby zobaczyć historię zamówień, musisz się{" "}
          <Link to="/login">zalogować</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1 style={{ margin: 0 }}>Zamówienia</h1>

      {loading && <div className="card">Ładowanie...</div>}
      {err && <div className="card">Błąd: {err}</div>}

      {!loading && !err && orders.length === 0 && (
        <div className="card">Brak zamówień.</div>
      )}

      <div className="grid" style={{ gap: 12 }}>
        {orders.map((o) => (
          <div key={o.id} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>#{o.id.slice(0, 8)}</strong>
                <div className="muted">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong>{Number(o.total).toFixed(2)} $</strong>
                <div>
                  <Link to={`/orders/${o.id}`}>Szczegóły →</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
