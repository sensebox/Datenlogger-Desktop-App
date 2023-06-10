import { createContext, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ViewProps {
    children: React.ReactNode | React.ReactNode[]
}

export type AuthContextType = {
    token: string | null
    onLogin: () => void
    onLogout: () => void
  }

const fakeAuth = () : Promise<string> =>
  new Promise((resolve) => {
    setTimeout(() => resolve('2342f2f1d131rf12'), 250);
  });

const AuthContext = createContext<AuthContextType>({
    token: null,
    onLogin: () => {},
    onLogout: () => {}
});

export const useAuth = () => {
    return useContext(AuthContext);
  };

export default function AuthProvider({children}: ViewProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const [token, setToken] = useState<string | null>(null)

    const handleLogin = async () => {
        const token = await fakeAuth()

        setToken(token)

        const origin = location.state?.from?.pathname || '/uploads'
        navigate(origin)
    }

    const handleLogout = () => {
        setToken(null)
    }

    const value = {
        token,
        onLogin: handleLogin,
        onLogout: handleLogout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}