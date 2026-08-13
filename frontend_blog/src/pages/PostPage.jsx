import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  createPostComment,
  getPostComments,
  getPublishedPostBySlug,
  likePost,
} from "../api/posts";

import ReactMarkdown from "react-markdown";

export default function PostPage() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [authorName, setAuthorName] = useState("");
  const [commentContent, setCommentContent] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] =
    useState(false);

  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");

  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState("");


 useEffect(() => {
  async function loadPostPage() {
    try {
      setIsLoading(true);
      setError("");

      const postData =
        await getPublishedPostBySlug(slug);

      const commentsData =
        await getPostComments(postData.id);

      setPost(postData);
      setComments(commentsData);
    } catch (requestError) {
      console.error(requestError);

      if (requestError.response?.status === 404) {
        setError(
          "Cet article n’existe pas ou n’est pas publié."
        );
      } else {
        setError(
          "Impossible de récupérer l’article pour le moment."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  loadPostPage();
}, [slug]);

  async function handleLike() {
    try {
        setIsLiking(true);
        setLikeError("");

        const updatedPost = await likePost(post.id);

        setPost(updatedPost);
    } catch (requestError) {
        console.error(requestError);

        setLikeError(
        "Impossible d’ajouter le like pour le moment."
        );
    } finally {
        setIsLiking(false);
    }
}

  async function handleCommentSubmit(event) {
    event.preventDefault();

    const cleanAuthorName = authorName.trim();
    const cleanContent = commentContent.trim();

    setCommentError("");
    setCommentSuccess("");

    if (cleanAuthorName.length < 2) {
      setCommentError(
        "Le nom doit contenir au moins deux caractères."
      );
      return;
    }

    if (!cleanContent) {
      setCommentError(
        "Le commentaire ne peut pas être vide."
      );
      return;
    }

    try {
      setIsSubmittingComment(true);

      const newComment = await createPostComment(post.id, {
        author_name: cleanAuthorName,
        content: cleanContent,
      });

      setComments((currentComments) => [
        newComment,
        ...currentComments,
      ]);

      setAuthorName("");
      setCommentContent("");
      setCommentSuccess("Votre commentaire a été ajouté.");
    } catch (requestError) {
      console.error(requestError);

      if (requestError.response?.status === 422) {
        setCommentError(
          "Le commentaire envoyé n’est pas valide."
        );
      } else if (requestError.response?.status === 404) {
        setCommentError(
          "Cet article n’existe plus ou n’est plus publié."
        );
      } else {
        setCommentError(
          "Impossible d’ajouter le commentaire."
        );
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }


  if (isLoading) {
    return (
      <main>
        <p>Chargement de l’article...</p>
      </main>
    );
  }


  if (error) {
    return (
      <main>
        <p>{error}</p>

        <Link to="/blog">
          Retour au blog
        </Link>
      </main>
    );
  }


  if (!post) {
    return null;
  }


  return (
  <main className="post-page">
    <Link
      to="/blog"
      className="post-page__back"
    >
      ← Retour au blog
    </Link>

    <article className="article">
      <header className="article__header">
        <h1 className="article__title">
          {post.title}
        </h1>

        {post.summary && (
          <p className="article__summary">
            {post.summary}
          </p>
        )}

        <div className="article__meta">
          <span>
            Publié le{" "}
            {new Date(
              post.published_at ?? post.created_at
            ).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>

          <span>
            {post.likes_count}{" "}
            {post.likes_count > 1 ? "likes" : "like"}
          </span>
        </div>

        <button
          type="button"
          className="like-button"
          onClick={handleLike}
          disabled={isLiking}
        >
          {isLiking
            ? "Ajout..."
            : `♥ J’aime (${post.likes_count})`}
        </button>

        {likeError && (
          <p className="form-error">
            {likeError}
          </p>
        )}
      </header>

      <div className="article__content">
        <ReactMarkdown>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>

    <section className="comments-section">
      <header className="comments-section__header">
        <h2>
          Commentaires ({comments.length})
        </h2>

        <p>
          Une remarque, une question ou un retour ?
        </p>
      </header>

      <form
        className="comment-form"
        onSubmit={handleCommentSubmit}
      >
        <div className="form-field">
          <label htmlFor="author-name">
            Votre nom
          </label>

          <input
            id="author-name"
            type="text"
            value={authorName}
            onChange={(event) =>
              setAuthorName(event.target.value)
            }
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="comment-content">
            Votre commentaire
          </label>

          <textarea
            id="comment-content"
            value={commentContent}
            onChange={(event) =>
              setCommentContent(event.target.value)
            }
            rows={5}
            maxLength={1000}
            required
          />
        </div>

        {commentError && (
          <p className="form-error">
            {commentError}
          </p>
        )}

        {commentSuccess && (
          <p className="form-success">
            {commentSuccess}
          </p>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmittingComment}
        >
          {isSubmittingComment
            ? "Envoi..."
            : "Publier le commentaire"}
        </button>
      </form>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="empty-state">
            <p>
              Aucun commentaire. Soyez le premier à réagir.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <article
              className="comment-card"
              key={comment.id}
            >
              <header className="comment-card__header">
                <strong>
                  {comment.author_name}
                </strong>

                <span>
                  {new Date(
                    comment.created_at
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </header>

              <p className="comment-card__content">
                {comment.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  </main>
);
}