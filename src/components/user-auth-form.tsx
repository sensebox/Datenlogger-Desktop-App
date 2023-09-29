import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useLocation, useNavigate } from "react-router-dom";

import useOpenSenseMapLogin from "@/lib/useOpenSenseMapLogin";
import { toast } from "./ui/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { login, logout } = useOpenSenseMapLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const router = useNavigate();
  const [placeholder, setPlaceholder] = React.useState<string>("");
  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value; // typechecks!
    const password = target.password.value; // typechecks!

    await login(email, password);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const origin = location.state?.from?.pathname || "/uploads";
    navigate(origin);
    toast({
      title: "Login erfolgreich",
      description: "Du wurdest erfolgreich eingeloggt",
    });
  }
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            {/* <input name="csrfToken" type="hidden" defaultValue={csrfToken} /> */}
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="password"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with openSenseMap
          </Button>
        </div>
      </form>
    </div>
  );
}
