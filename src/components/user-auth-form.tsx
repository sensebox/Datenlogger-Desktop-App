import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons"; // Verwende Icons hier
import { useAuth } from "./auth-provider";
import { LockIcon, MailIcon } from "lucide-react";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { onLogin } = useAuth();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value; // typechecks!
    const password = target.password.value; // typechecks!

    await onLogin(email, password);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <div
      className={cn("grid gap-6 p-4 rounded-lg shadow-md bg-white", className)}
      {...props}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2">
          <div className="flex items-center space-x-2 border-b pb-2">
            <MailIcon className="h-5 w-5 text-gray-500" />
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="w-full px-2 py-1 border-none focus:ring-0"
            />
          </div>
          <div className="flex items-center space-x-2 border-b pb-2">
            <LockIcon className="h-5 w-5 text-gray-500" />
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              className="w-full px-2 py-1 border-none focus:ring-0"
            />
          </div>
        </div>
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In to openSenseMap
        </Button>
      </form>
    </div>
  );
}
