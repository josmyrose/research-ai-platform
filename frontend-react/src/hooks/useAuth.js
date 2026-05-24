import { authStorage } from "../services/storageService";

export const useAuth = () => ({
  token: authStorage.getToken(),
  currentUser: authStorage.getLoggedInUser(),
  isAuthenticated: Boolean(authStorage.getToken()),
});

