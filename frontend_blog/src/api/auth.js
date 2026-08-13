import api from "./axios";


export async function loginAdmin(username, password) {
  const formData = new URLSearchParams();

  formData.append("username", username);
  formData.append("password", password);

  const response = await api.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
}


export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}