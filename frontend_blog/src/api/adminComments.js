import api from "./axios";


export async function getAdminComments() {
  const response = await api.get("/admin/comments");
  return response.data;
}


export async function deleteAdminComment(commentId) {
  await api.delete(`/admin/comments/${commentId}`);
}