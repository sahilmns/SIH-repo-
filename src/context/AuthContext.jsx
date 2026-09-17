import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("labellens_user");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        localStorage.removeItem("labellens_user");
        return null;
      }
    }

    return null;
  });

  const login = (userData) => {
    const userWithRole = {
      email: userData.email,
      role: userData.role || "inspector",
    };

    localStorage.setItem(
      "labellens_user",
      JSON.stringify(userWithRole)
    );

    setUser(userWithRole);
  };

  const logout = () => {
    localStorage.removeItem("labellens_user");

    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}