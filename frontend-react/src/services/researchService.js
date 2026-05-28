import { apiClient, getAuthConfig } from "../api/client";

export const sendChatMessage = (message, options = {}) =>
  apiClient.post("/chat/", { message, ...options }, getAuthConfig());

export const getChatHistory = (search = "") =>
  apiClient.get("/chat/history", {
    ...getAuthConfig(),
    params: search ? { search } : {},
  });

export const deleteChatHistoryItem = (chatId) =>
  apiClient.delete(`/chat/history/${chatId}`, getAuthConfig());

export const uploadResearchFile = (formData) =>
  apiClient.post("/upload/", formData, getAuthConfig());

export const searchResearch = (query, limit = 8) =>
  apiClient.get("/search/", {
    ...getAuthConfig(),
    params: { q: query, limit },
  });

export const getLibraryItems = () => apiClient.get("/library/", getAuthConfig());

export const createLibraryItem = (payload) =>
  apiClient.post("/library/", payload, getAuthConfig());

export const uploadLibraryFile = (formData) =>
  apiClient.post("/upload/", formData, getAuthConfig());

export const getLibraryBibtex = (itemId) =>
  apiClient.get(`/library/${itemId}/bibtex`, getAuthConfig());

export const getScholarEntries = () => apiClient.get("/scholars/", getAuthConfig());

export const createScholarEntry = (payload) =>
  apiClient.post("/scholars/", payload, getAuthConfig());
