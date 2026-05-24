import { apiClient } from "../api/client";

export const login = (credentials) => apiClient.post("/auth/login", credentials);

export const signup = (payload) => apiClient.post("/auth/signup", payload);

