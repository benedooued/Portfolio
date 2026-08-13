import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { createAdminPost } from "../api/adminPosts";
import PostForm from "../components/admin/PostForm";


export default function CreatePostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");


  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanSummary = summary.trim();
    const cleanContent = content.trim();

    setError("");

    if (cleanTitle.length < 3) {
      setError(
        "Le titre doit contenir au moins trois caractères."
      );
      return;
    }

    if (!cleanContent) {
      setError(
        "Le contenu de l’article est obligatoire."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createAdminPost({
        title: cleanTitle,
        summary: cleanSummary || null,
        content: cleanContent,
        published,
      });

      navigate("/admin", {
        replace: true,
      });
    } catch (requestError) {
      console.error(requestError);

      if (requestError.response?.status === 422) {
        setError(
          "Certaines données de l’article ne sont pas valides."
        );
      } else if (
        requestError.response?.status === 401
      ) {
        setError(
          "Votre session a expiré. Reconnectez-vous."
        );
      } else if (
        requestError.response?.status === 403
      ) {
        setError(
          "Vous n’avez pas l’autorisation de créer un article."
        );
      } else {
        setError(
          "Impossible de créer l’article pour le moment."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }


 return (
  <main className="admin-page">
    <header className="admin-page__header">
      <div>
        <p className="admin-page__eyebrow">
          Articles
        </p>

        <h1>Créer un article</h1>

        <p>
          Rédigez un nouvel article puis choisissez
          s’il doit être publié immédiatement.
        </p>
      </div>

      <Link
        to="/admin"
        className="secondary-button"
      >
        Retour
      </Link>
    </header>

    <PostForm
      title={title}
      setTitle={setTitle}
      summary={summary}
      setSummary={setSummary}
      content={content}
      setContent={setContent}
      published={published}
      setPublished={setPublished}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
      submitLabel={
        published
          ? "Créer et publier"
          : "Enregistrer le brouillon"
      }
    />
  </main>
);
}