import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { api, type Review as ApiReview } from "../api/api";
import { useAuth } from "../auth/AuthContext";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

// dopasowane do backendu/wrappera
type Review = ApiReview;

export default function ProductDetails() {
  const { id } = useParams();
  const productId = Number(id);

  const { addItem } = useCart();
  const { user, accessToken } = useAuth();

  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const myReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((r) => r.userId === user.id) ?? null;
  }, [reviews, user]);

  const canEditReview = (r: Review) => {
    if (!user) return false;
    return user.role === "ADMIN" || r.userId === user.id;
  };

  // 1) produkt z FakeStore
  useEffect(() => {
    if (!Number.isFinite(productId)) return;
    (async () => {
      try {
        setLoadingProduct(true);
        const pr = await fetch(
          `https://fakestoreapi.com/products/${productId}`
        );
        const pdata = (await pr.json()) as Product;
        setP(pdata);
      } finally {
        setLoadingProduct(false);
      }
    })();
  }, [productId]);

  // 2) opinie z backendu (przez wrapper api.reviews.*)
  const loadReviews = async () => {
    setLoadingReviews(true);
    setReviewsError(null);
    try {
      const list = await api.reviews.listForProduct(productId);
      setReviews(list ?? []);
    } catch {
      setReviews([]);
      setReviewsError(
        "Nie udało się pobrać opinii (backend nie działa albo CORS)."
      );
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(productId)) return;
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const onAddToCart = () => {
    if (!p) return;
    addItem(
      { productId: p.id, title: p.title, price: p.price, image: p.image },
      qty
    );
  };

  const submitReview = async () => {
    if (!user || !accessToken) {
      alert("Zaloguj się, żeby dodać opinię.");
      return;
    }
    await api.reviews.create(accessToken, productId, { rating, message });
    setMessage("");
    setRating(5);
    await loadReviews();
  };

  const updateReview = async (reviewId: string) => {
    if (!accessToken) return;
    await api.reviews.update(accessToken, reviewId, { rating, message });
    setMessage("");
    setRating(5);
    await loadReviews();
  };

  const deleteReview = async (reviewId: string) => {
    if (!accessToken) return;
    await api.reviews.remove(accessToken, reviewId);
    await loadReviews();
  };

  if (!Number.isFinite(productId)) return <p>Nieprawidłowe ID produktu.</p>;
  if (loadingProduct) return <p>Ładowanie produktu…</p>;
  if (!p) return <p>Nie znaleziono produktu.</p>;

  return (
    <div>
      <Link to="/products">← Back to products</Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 24,
          marginTop: 16,
        }}
      >
        <div
          style={{ border: "1px solid #e5e5e5", borderRadius: 16, padding: 16 }}
        >
          <img
            src={p.image}
            alt={p.title}
            style={{ width: "100%", height: 320, objectFit: "contain" }}
          />
        </div>

        <div>
          <h1 style={{ marginTop: 0 }}>{p.title}</h1>
          <div style={{ opacity: 0.8 }}>{p.category}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
            {p.price.toFixed(2)} $
          </div>
          <p style={{ marginTop: 12, lineHeight: 1.5 }}>{p.description}</p>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <label>
              Ilość:&nbsp;
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                style={{
                  width: 90,
                  padding: 8,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                }}
              />
            </label>
            <button onClick={onAddToCart} style={{ padding: "10px 14px" }}>
              Dodaj do koszyka
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Opinie</h2>

        {loadingReviews ? (
          <p>Ładowanie opinii…</p>
        ) : reviewsError ? (
          <p style={{ color: "crimson" }}>
            {reviewsError} Upewnij się, że backend działa na{" "}
            <code>http://localhost:3000</code>.
          </p>
        ) : null}

        {!user ? (
          <p style={{ opacity: 0.8 }}>
            Żeby dodać opinię, musisz się <Link to="/login">zalogować</Link>.
          </p>
        ) : (
          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 16,
              padding: 16,
              display: "grid",
              gap: 10,
              maxWidth: 700,
            }}
          >
            <label>
              Ocena (1-5):&nbsp;
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) =>
                  setRating(Math.min(5, Math.max(1, Number(e.target.value))))
                }
                style={{
                  width: 90,
                  padding: 8,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                }}
              />
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Twoja opinia..."
              rows={4}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              {!myReview ? (
                <button onClick={submitReview} disabled={!message.trim()}>
                  Dodaj opinię
                </button>
              ) : (
                <button
                  onClick={() => updateReview(myReview.id)}
                  disabled={!message.trim()}
                >
                  Zapisz edycję mojej opinii
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {reviews.length === 0 && !reviewsError ? (
            <p>Brak opinii.</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>
                    {r.user?.name ?? r.email}
                  </div>
                  <div style={{ fontWeight: 800 }}>{r.rating}/5</div>
                </div>
                <div style={{ marginTop: 8 }}>{r.message}</div>

                {user && canEditReview(r) && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        setRating(r.rating);
                        setMessage(r.message);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Edytuj
                    </button>
                    <button onClick={() => deleteReview(r.id)}>Usuń</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 320px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
