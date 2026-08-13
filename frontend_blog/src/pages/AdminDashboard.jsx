import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser } from "../api/auth";
import { getAdminPosts, deleteAdminPost, updateAdminPost } from "../api/adminPosts";
import { removeToken } from "../auth/tokenStorage";


export default function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const [updatingPostId, setUpdatingPostId] = useState(null);
  const [updateError, setUpdateError] = useState("");


  async function handleTogglePublished(post) {
  try {
    setUpdatingPostId(post.id);
    setUpdateError("");

    const updatedPost = await updateAdminPost(
      post.id,
      {
        published: !post.published,
      }
    );

    setPosts((currentPosts) =>
      currentPosts.map((currentPost) =>
        currentPost.id === post.id
          ? updatedPost
          : currentPost
      )
    );
  } catch (requestError) {
    console.error(requestError);

    if (requestError.response?.status === 404) {
      setUpdateError("Cet article n’existe plus.");
    } else if (requestError.response?.status === 403) {
      setUpdateError(
        "Vous n’avez pas l’autorisation de modifier cet article."
      );
    } else {
      setUpdateError(
        "Impossible de modifier le statut de l’article."
      );
    }
  } finally {
    setUpdatingPostId(null);
  }
}


  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const [userData, postsData] = await Promise.all([
          getCurrentUser(),
          getAdminPosts(),
        ]);

        setUser(userData);
        setPosts(postsData);
      } catch (requestError) {
        console.error(requestError);

        setError(
          "Impossible de charger le tableau de bord."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);


  async function handleDeletePost(post) {
  const confirmed = window.confirm(
    `Supprimer définitivement l’article « ${post.title} » ?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingPostId(post.id);
    setDeleteError("");

    await deleteAdminPost(post.id);

    setPosts((currentPosts) =>
      currentPosts.filter(
        (currentPost) => currentPost.id !== post.id
      )
    );
  } catch (requestError) {
    console.error(requestError);

    if (requestError.response?.status === 404) {
      setDeleteError("Cet article n’existe plus.");
    } else if (requestError.response?.status === 403) {
      setDeleteError(
        "Vous n’avez pas l’autorisation de supprimer cet article."
      );
    } else {
      setDeleteError(
        "Impossible de supprimer l’article."
      );
    }
  } finally {
    setDeletingPostId(null);
  }
}

  function handleLogout() {
    removeToken();

    navigate("/admin/login", {
      replace: true,
    });
  }


  if (isLoading) {
    return (
      <main>
        <p>Chargement du tableau de bord...</p>
      </main>
    );
  }


  if (error) {
    return (
      <main>
        <p>{error}</p>

        <button
          type="button"
          onClick={handleLogout}
        >
          Retour à la connexion
        </button>
      </main>
    );
  }


  return (
  <main className="admin-page">
    <header className="admin-page__header">
      <div>
        <p className="admin-page__eyebrow">
          Tableau de bord
        </p>

        <h1>Articles</h1>

        <p>
          Connecté en tant que{" "}
          <strong>{user.username}</strong>
        </p>
      </div>

      <div className="admin-page__actions">
        <Link
          to="/admin/posts/new"
          className="primary-button"
        >
          Nouvel article
        </Link>

        <button
          type="button"
          className="secondary-button"
          onClick={handleLogout}
        >
          Se déconnecter
        </button>
      </div>
    </header>

    {deleteError && (
      <p className="form-error">
        {deleteError}
      </p>
    )}

    {updateError && (
      <p className="form-error">
        {updateError}
      </p>
    )}

    {posts.length === 0 ? (
      <div className="empty-state">
        <p>Aucun article pour le moment.</p>
      </div>
    ) : (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Statut</th>
              <th>Likes</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <strong>{post.title}</strong>
                </td>

                <td>
                  <span
                    className={
                      post.published
                        ? "status-badge status-badge--published"
                        : "status-badge status-badge--draft"
                    }
                  >
                    {post.published
                      ? "Publié"
                      : "Brouillon"}
                  </span>
                </td>

                <td>{post.likes_count}</td>

                <td>
                  {new Date(
                    post.published_at ??
                    post.created_at
                  ).toLocaleDateString("fr-FR")}
                </td>

                <td>
                  <div className="admin-actions">
                    <Link
                      className="admin-action-link"
                      to={`/admin/posts/${post.id}/edit`}
                    >
                      Modifier
                    </Link>

                    {post.published && (
                      <Link
                        className="admin-action-link"
                        to={`/blog/${post.slug}`}
                      >
                        Voir
                      </Link>
                    )}

                    <button
                      type="button"
                      className="admin-action-button"
                      onClick={() =>
                        handleTogglePublished(post)
                      }
                      disabled={
                        updatingPostId === post.id ||
                        deletingPostId === post.id
                      }
                    >
                      {updatingPostId === post.id
                        ? "Mise à jour..."
                        : post.published
                          ? "Dépublier"
                          : "Publier"}
                    </button>

                    <button
                      type="button"
                      className="admin-action-button admin-action-button--danger"
                      onClick={() =>
                        handleDeletePost(post)
                      }
                      disabled={
                        deletingPostId === post.id ||
                        updatingPostId === post.id
                      }
                    >
                      {deletingPostId === post.id
                        ? "Suppression..."
                        : "Supprimer"}
                    </button>
                  </div>
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