import { useState } from "react";
import { Link,useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";


import { loginAdmin } from "../api/auth";
import { getToken, saveToken } from "../auth/tokenStorage";


export default function LoginPage() {
  
  const location = useLocation();

  const destination = location.state?.from || "/admin";
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(event) {
    event.preventDefault();

    const cleanUsername = username.trim();

    setError("");

    if (!cleanUsername || !password) {
      setError(
        "Le nom d’utilisateur et le mot de passe sont obligatoires."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await loginAdmin(
        cleanUsername,
        password
      );

      saveToken(data.access_token);

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      console.error(requestError);

      if (requestError.response?.status === 401) {
        setError(
          "Nom d’utilisateur ou mot de passe incorrect."
        );
      } else if (requestError.response?.status === 403) {
        setError("Ce compte est désactivé.");
      } else {
        setError(
          "Impossible de se connecter pour le moment."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
  async function redirectAuthenticatedUser() {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const user = await getCurrentUser();

      if (user.role === "admin") {
        navigate(destination, {
          replace: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  redirectAuthenticatedUser();
}, [destination, navigate]);


 return (
  <main className="login-page">
    <section className="login-card">
      <div className="login-card__header">
        <p className="admin-page__eyebrow">
          Administration
        </p>

        <h1>Connexion</h1>

        <p>
          Connectez-vous pour gérer les articles
          et les commentaires.
        </p>
      </div>

      <form
        className="login-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="username">
            Nom d’utilisateur
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            autoComplete="username"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">
            Mot de passe
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="primary-button login-form__button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Connexion..."
            : "Se connecter"}
        </button>
      </form>

      <Link
        to="/"
        className="login-card__back"
      >
        ← Retour au portfolio
      </Link>
    </section>
  </main>
);
}