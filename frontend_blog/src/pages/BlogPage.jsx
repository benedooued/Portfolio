import { useEffect, useState } from "react";

import { getPublishedPosts } from "../api/posts";
import PostCard from "../components/blog/PostCard";
import LoadingState from "../components/common/LoadingState";
import ErrorMessage from "../components/common/ErrorMessage";


export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getPublishedPosts();

        setPosts(data);
      } catch (requestError) {
        console.error(requestError);

        setError(
          "Impossible de récupérer les articles pour le moment."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);


  if (isLoading) {
  return (
      <main className="blog-page">
        <LoadingState
          message="Chargement des articles..."
        />
      </main>
    );
  }


  if (error) {
    return (
      <main className="blog-page">
        <ErrorMessage message={error} />
      </main>
    );
  }


  return (
  <main className="blog-page">
    <header className="blog-page__header">
      <p className="blog-page__eyebrow">Journal technique</p>

      <h1>Blog</h1>

      <p className="blog-page__intro">
        Retours d’expérience, projets, backend, IA et apprentissages techniques.
      </p>
    </header>

    {posts.length === 0 ? (
      <div className="empty-state">
        <p>Aucun article publié pour le moment.</p>
      </div>
    ) : (
      <section className="post-grid">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))}
      </section>
    )}
  </main>
);
}