import { SignInResponse } from "@/types";
import { createContext, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

interface ViewProps {
  children: React.ReactNode | React.ReactNode[];
}

export type AuthContextType = {
  signInResponse: SignInResponse | null;
  onLogin: (username: string, password: string) => void;
  onLogout: () => void;
};

const fakeAuth = async (
  username: string,
  password: string
): Promise<SignInResponse> => {
  const response = await fetch(
    `https://api.testing.opensensemap.org/users/sign-in`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    }
  );
  const user = await response.json();
  return user;
};

const AuthContext = createContext<AuthContextType>({
  signInResponse: null,
  onLogin: () => {},
  onLogout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export default function AuthProvider({ children }: ViewProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { toast } = useToast();

  const [token, setToken] = useState<SignInResponse | null>(null);

  const handleLogin = async (username: string, password: string) => {
    const response = await fakeAuth(username, password);

    setToken(response);

    if (response.code !== "Authorized") {
      toast({
        variant: "destructive",
        title: `${response.code}`,
        description: `${response.message}`,
      });
    }

    const origin = location.state?.from?.pathname || "/uploads";
    navigate(origin);
  };

  const handleLogout = () => {
    setToken(null);
  };

  const value = {
    signInResponse: token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
