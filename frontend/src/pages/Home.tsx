import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";

export default function Home() {
  const { user } = useAuth();
  const { count } = useCart();

  return (
    <div className="home">
      <div className="card home-hero">
        <div className="home-hero-content">
          <h1 style={{ marginTop: 0 }}>Sklep internetowy</h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            Wybierz produkty, dodaj do koszyka i złóż zamówienie. Po zalogowaniu
            możesz dodawać opinie, a jako ADMIN także je usuwać.
          </p>

          <div className="row home-actions">
            <Link className="btn btn-primary" to="/products">
              Przejdź do produktów →
            </Link>
            <Link className="btn" to="/cart">
              Koszyk ({count})
            </Link>
            <Link className="btn" to="/orders">
              Zamówienia
            </Link>
            {!user && (
              <Link className="btn btn-ghost" to="/login">
                Zaloguj się
              </Link>
            )}
          </div>

          {user ? (
            <div className="home-badge">
              Zalogowany jako <strong>{user.name}</strong> ({user.role})
            </div>
          ) : (
            <div className="home-badge">
              Testowe konto: <strong>user2@test.pl</strong> /{" "}
              <strong>secret12</strong>
            </div>
          )}
        </div>

        <div className="home-hero-aside">
          <div className="home-grid">
            <div className="home-grid-item">
              <div className="home-icon">🛒</div>
              <div className="home-grid-title">Szybki koszyk</div>
              <div className="muted">
                Dodawaj produkty i finalizuj zamówienia.
              </div>
            </div>

            <div className="home-grid-item">
              <div className="home-icon">⭐</div>
              <div className="home-grid-title">Opinie</div>
              <div className="muted">
                Jedna opinia na produkt dla użytkownika.
              </div>
            </div>

            <div className="home-grid-item">
              <div className="home-icon">📦</div>
              <div className="home-grid-title">Historia</div>
              <div className="muted">Wgląd w poprzednie zamówienia.</div>
            </div>

            <div className="home-grid-item">
              <div className="home-icon">🔐</div>
              <div className="home-grid-title">Role</div>
              <div className="muted">USER i ADMIN – różne uprawnienia.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-columns">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Jak to działa</h2>
          <ol className="home-steps">
            <li>
              Wejdź w <strong>Products</strong> i wybierz coś dla siebie.
            </li>
            <li>
              Dodaj do koszyka i przejdź do <strong>Cart</strong>.
            </li>
            <li>
              Złóż zamówienie i sprawdź je w <strong>Orders</strong>.
            </li>
            <li>Po zalogowaniu dodaj opinię na stronie produktu.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
