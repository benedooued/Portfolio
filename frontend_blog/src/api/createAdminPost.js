import api from "./axios";


export async function getAdminPosts() {
  const response = await api.get("/admin/posts");
  return response.data;
}


export async function createAdminPost(postData) {
  const response = await api.post(
    "/admin/posts",
    postData
  );

  return response.data;
}