import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteAdminComment,
  getAdminComments,
} from "../api/adminComments";


export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCommentId, setDeletingCommentId] =
    useState(null);

  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");


  useEffect(() => {
    async function loadComments() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAdminComments();
        setComments(data);
      } catch (requestError) {
        console.error(requestError);

        setError(
          "Impossible de charger les commentaires."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadComments();
  }, []);


  async function handleDeleteComment(comment) {
    const confirmed = window.confirm(
      `Supprimer le commentaire de ${comment.author_name} ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCommentId(comment.id);
      setDeleteError("");

      await deleteAdminComment(comment.id);

      setComments((currentComments) =>
        currentComments.filter(
          (currentComment) =>
            currentComment.id !== comment.id
        )
      );
    } catch (requestError) {
      console.error(requestError);

      if (requestError.response?.status === 404) {
        setDeleteError(
          "Ce commentaire n’existe plus."
        );
      } else if (
        requestError.response?.status === 403
      ) {
        setDeleteError(
          "Vous n’avez pas l’autorisation de supprimer ce commentaire."
        );
      } else {
        setDeleteError(
          "Impossible de supprimer le commentaire."
        );
      }
    } finally {
      setDeletingCommentId(null);
    }
  }


  if (isLoading) {
    return (
      <main>
        <p>Chargement des commentaires...</p>
      </main>
    );
  }


  if (error) {
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
          Modération
        </p>

        <h1>Commentaires</h1>

        <p>
          Consultez et supprimez les commentaires publiés.
        </p>
      </div>

      <Link
        to="/admin"
        className="secondary-button"
      >
        Retour aux articles
      </Link>
    </header>

    {deleteError && (
      <p className="form-error">
        {deleteError}
      </p>
    )}

    {comments.length === 0 ? (
      <div className="empty-state">
        <p>Aucun commentaire pour le moment.</p>
      </div>
    ) : (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Auteur</th>
              <th>Commentaire</th>
              <th>Article</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td>
                  <strong>
                    {comment.author_name}
                  </strong>
                </td>

                <td>
                  <p className="admin-comment-preview">
                    {comment.content}
                  </p>
                </td>

                <td>
                    <span>
                      Article #{comment.post_id}
                    </span>
                </td>

                <td>
                  {new Date(
                    comment.created_at
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td>
                  <button
                    type="button"
                    className="admin-action-button admin-action-button--danger"
                    onClick={() =>
                      handleDeleteComment(comment)
                    }
                    disabled={
                      deletingCommentId === comment.id
                    }
                  >
                    {deletingCommentId === comment.id
                      ? "Suppression..."
                      : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </main>
);
}