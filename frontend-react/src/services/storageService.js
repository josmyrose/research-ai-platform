export const authStorage = {
  getToken: () => localStorage.getItem("token"),
  getLoggedInUser: () => localStorage.getItem("loggedInUser") || "",
  setSession: ({ token, username }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("loggedInUser", username);
  },
  clearSession: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
  },
};

