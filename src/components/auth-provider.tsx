import { SignInResponse } from "@/types";
import { createContext, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import storage from "@/lib/local-storage";
import { toast } from "sonner";

interface ViewProps {
  children: React.ReactNode | React.ReactNode[];
}

export type AuthContextType = {
  signInResponse: SignInResponse | undefined;
  onLogin: (username: string, password: string) => void;
  onLogout: () => void;
};

const fakeAuth = async (
  username: string,
  password: string
): Promise<SignInResponse> => {
  const response = await fetch(`https://api.opensensemap.org/users/sign-in`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: username,
      password: password,
    }),
  });
  const user = await response.json();
  return user;
};

const AuthContext = createContext<AuthContextType>({
  signInResponse: undefined,
  onLogin: () => {},
  onLogout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export default function AuthProvider({ children }: ViewProps) {
  const navigate = useNavigate();
  const location = useLocation();


  // Load SignInResponse from localStorage and set it on context
  const auth = storage.get<SignInResponse | undefined>("auth");
  const [token, setToken] = useState<SignInResponse | undefined>(auth);

  const handleLogin = async (username: string, password: string) => {
    const response = await fakeAuth(username, password);

    if (response.code !== "Authorized") {
      toast.error("Login failed. Please check your credentials.");


      return;
    }

    setToken(response);
    response.timestamp = Date.now();
    storage.set("auth", response);
    const origin = location.state?.from?.pathname || "/uploads";
    navigate(origin);
  };

  const handleLogout = () => {
    setToken(undefined);
    storage.remove("auth");
  };

  const value = {
    signInResponse: token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
