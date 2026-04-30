import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await adminLogin(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" />
      <div className="admin-login-card">
        {/* Shield Icon */}
        <div className="admin-login-card__icon">
          <Shield className="w-8 h-8" />
        </div>

        <h1 className="admin-login-card__title">Admin Portal</h1>
        <p className="admin-login-card__subtitle">
          Restricted access — administrators only
        </p>

        {error && (
          <div className="admin-login-card__error">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-form__group">
            <label htmlFor="admin-email" className="admin-login-form__label">
              Email Address
            </label>
            <div className="admin-login-form__input-wrap">
              <Mail className="admin-login-form__input-icon w-4 h-4" />
              <input
                id="admin-email"
                type="email"
                className="admin-login-form__input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-login-form__group">
            <label htmlFor="admin-password" className="admin-login-form__label">
              Password
            </label>
            <div className="admin-login-form__input-wrap">
              <Lock className="admin-login-form__input-icon w-4 h-4" />
              <input
                id="admin-password"
                type="password"
                className="admin-login-form__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-form__submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Sign In as Admin</span>
              </>
            )}
          </button>
        </form>

        <p className="admin-login-card__footer">
          Not an admin?{" "}
          <a href="/login" className="admin-login-card__footer-link">
            Go to Manager Login
          </a>
        </p>
      </div>
    </div>
  );
}
