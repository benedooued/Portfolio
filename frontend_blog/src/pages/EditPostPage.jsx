import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getAdminPost,
  updateAdminPost,
} from "../api/adminPosts";
import PostForm from "../components/admin/PostForm";


export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");


  useEffect(() => {
    async function loadPost() {
      try {
        setIsLoading(true);
        setError("");

        const post = await getAdminPost(id);

        setTitle(post.title);
        setSummary(post.summary ?? "");
        setContent(post.content);
        setPublished(post.published);
      } catch (requestError) {
        console.error(requestError);

        if (requestError.response?.status === 404) {
          setError("Article introuvable.");
        } else {
          setError(
            "Impossible de charger l’article."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [id]);


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

      await updateAdminPost(id, {
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

      if (requestError.response?.status === 404) {
        setError("Article introuvable.");
      } else if (
        requestError.response?.status === 422
      ) {
        setError(
          "Certaines données ne sont pas valides."
        );
      } else {
        setError(
          "Impossible de modifier l’article."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }


  if (isLoading) {
    return (
      <main>
        <p>Chargement de l’article...</p>
      </main>
    );
  }


  if (error && !title) {
    return (
      <main>
        <p>{error}</p>

        <Link to="/admin">
          Retour au tableau de bord
        </Link>
      </main>
    );
  }


  return (
  <main className="admin-page">
    <header className="admin-page__header">
      <div>
        <p className="admin-page__eyebrow">
          Articles
        </p>

        <h1>Modifier l’article</h1>

        <p>
          Modifiez le contenu ou le statut de publication.
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
      submitLabel="Enregistrer les modifications"
    />
  </main>
);
}