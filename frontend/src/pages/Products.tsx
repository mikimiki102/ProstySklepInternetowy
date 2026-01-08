import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch("https://fakestoreapi.com/products");
      const data = (await r.json()) as Product[];
      setItems(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((p) => p.title.toLowerCase().includes(qq));
  }, [items, q]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Products</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Szukaj po nazwie..."
        className="card"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 14,
          border: "1px solid var(--border)",
        }}
      />

      {loading ? <p>Ładowanie…</p> : null}

      <div className="grid-products" style={{ marginTop: 14 }}>
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            className="card product-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img className="product-img" src={p.image} alt={p.title} />
            <div style={{ fontWeight: 800 }}>{p.title}</div>
            <div className="muted">{p.category}</div>
            <div style={{ fontWeight: 800 }}>{p.price.toFixed(2)} $</div>
            <div className="muted" style={{ lineHeight: 1.5 }}>
              {p.description.length > 90
                ? p.description.slice(0, 90) + "…"
                : p.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
