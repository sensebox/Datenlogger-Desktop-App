import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "./auth-provider";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import storage from "@/lib/local-storage";
import useOpenSenseMapLogin from "@/lib/useOpenSenseMapLogin";

interface LoginResponse {
  // Definiere die Struktur der Login-Antwort hier
  // Zum Beispiel:
  code: number;
  message: string;
  token: string;
  refreshToken: string;
  data: {
    user: {
      name: string;
      email: string;
      role: string;
      language: string;
      emailIsConfirmed: boolean;
      boxes: string[];
    };
  };
}

const getInitials = function (string: string) {
  if (!string) return "";
  var names = string.split(" "),
    initials = names[0].substring(0, 1).toUpperCase();

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

export function UserNav() {
  const { logout, refreshToken } = useOpenSenseMapLogin();
  const [signInResponse, setSignInReponse] = useState<LoginResponse>();
  const param = useParams();

  useEffect(() => {
    setSignInReponse(storage.get("signInResponse"));
  }, [param]);

  useEffect(() => {
    const refreshOldToken = async () => {
      const timestamp: any = storage.get("timestamp");
      // if an hour has passed, get new token using the refresh token 3600000
      if (timestamp && Date.now() - timestamp > 3600000) {
        console.log("refreshing token");
        const oldtoken = storage.get("loginToken");
        await refreshToken();
        const newToken = storage.get("loginToken");
        console.log("old token", oldtoken);
        console.log("new token", newToken);
      }
    };
    refreshOldToken();
  });

  const handleLogout = async () => {
    await logout();
    setSignInReponse(undefined);
  };
  return (
    <>
      {signInResponse !== undefined ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(signInResponse.data.user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {signInResponse.data.user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {signInResponse.data.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {signInResponse !== null && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          to="/login"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
      )}
    </>
  );
}
