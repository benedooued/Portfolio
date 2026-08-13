import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  const publicationDate =
    post.published_at ?? post.created_at;

  return (
    <article className="post-card">
      <div className="post-card__content">
        <p className="post-card__meta">
          {new Date(publicationDate).toLocaleDateString(
            "fr-FR",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )}
        </p>

        <h2 className="post-card__title">
          {post.title}
        </h2>

        {post.summary && (
          <p className="post-card__summary">
            {post.summary}
          </p>
        )}
      </div>

      <footer className="post-card__footer">
        <span className="post-card__likes">
          ♥ {post.likes_count}
        </span>

        <Link
          className="post-card__link"
          to={`/blog/${post.slug}`}
        >
          Lire l’article →
        </Link>
      </footer>
    </article>
  );
}