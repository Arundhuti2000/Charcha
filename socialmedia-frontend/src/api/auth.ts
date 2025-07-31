import { tokenUtils } from "@/utils/tokenUtils";
import { apiFetch } from "./client";
import type { AuthResponse, CreateUser, LoginCredentials, User } from "./types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);
    return apiFetch("login", {
      method: "post",
      headers: {},
      body: formData,
    });
  },

  // POST /users - Register new user
  register: async (data: CreateUser): Promise<User> => {
    return apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // GET /users - Get current user profile
  getCurrentUser: async (): Promise<User> => {
    return apiFetch("/users");
  },

  logout: () => {
    tokenUtils.clear();
  },
};
