import { createContext, useContext, useState } from "react";
import { loginUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("access_token")
  );

  const login = async (email, password) => {
    const data = await loginUser(email, password);

    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}