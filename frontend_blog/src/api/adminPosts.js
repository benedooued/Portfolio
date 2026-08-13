import api from "./axios";

export async function getAdminPosts() {
  const response = await api.get("/admin/posts");
  return response.data;
}

export async function createAdminPost(postData) {
  const response = await api.post("/admin/posts", postData);
  return response.data;
}

export async function getAdminPost(postId) {
  const response = await api.get(`/admin/posts/${postId}`);
  return response.data;
}

export async function updateAdminPost(postId, postData) {
  const response = await api.patch(
    `/admin/posts/${postId}`,
    postData
  );

  return response.data;
}

export async function deleteAdminPost(postId) {
  await api.delete(`/admin/posts/${postId}`);
}