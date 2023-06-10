import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export default function Login() {
    const { onLogin } = useAuth();
    return (
        <h1>
            <Button onClick={onLogin}>
                Sign In
            </Button>
        </h1>
    )
}