import api from "./axios";


export async function getPublishedPosts() {
  const response = await api.get("/posts");
  return response.data;
}


export async function getPublishedPost(postId) {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
}


export async function getPublishedPostBySlug(slug) {
  const response = await api.get(`/posts/by-slug/${slug}`);
  return response.data;
}

export async function getPostComments(postId) {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
}


export async function createPostComment(postId, commentData) {
  const response = await api.post(
    `/posts/${postId}/comments`,
    commentData
  );

  return response.data;
}

export async function likePost(postId) {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
}