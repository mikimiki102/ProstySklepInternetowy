import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("user2@test.pl");
  const [password, setPassword] = useState("secret12");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav("/products");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div style={{ maxWidth: 520 }}>
        <h1>Login</h1>
        <p>
          Jesteś zalogowany jako: <b>{user.email}</b>
        </p>
        <button onClick={() => nav("/products")}>Wróć do produktów</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="hasło"
          type="password"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />

        <button
          disabled={loading}
          type="submit"
          style={{ padding: "10px 14px" }}
        >
          {loading ? "Logowanie..." : "Zaloguj"}
        </button>

        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>

      <p style={{ marginTop: 12, opacity: 0.8 }}>
        Testowe konto: <code>user2@test.pl</code> / <code>secret12</code>
      </p>
    </div>
  );
}
