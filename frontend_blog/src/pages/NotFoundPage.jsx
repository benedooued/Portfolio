import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <p className="not-found-card__code">
          404
        </p>

        <h1>Page introuvable</h1>

        <p>
          La page demandée n’existe pas ou a été déplacée.
        </p>

        <Link
          to="/"
          className="primary-button"
        >
          Retour à l’accueil
        </Link>
      </section>
    </main>
  );
}