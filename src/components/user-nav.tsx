import { LogIn, LogOut, Settings, User, UserIcon } from "lucide-react";

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
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AvatarImage } from "@radix-ui/react-avatar";
import osmLogo from "@/assets/favicon.svg";

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
  const { signInResponse, onLogout } = useAuth();

  return (
    <>
      {signInResponse !== undefined ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <Avatar className="w-12 h-12">
                <AvatarImage src={osmLogo} />
                <AvatarFallback className="bg-blue-200 text-blue-500">
                  {getInitials(signInResponse.data.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-start p-1">
                <p className="text-sm font-medium text-blue-600">
                  {signInResponse?.data?.user?.name}{" "}
                </p>
                <p className="text-sm font-medium text-blue-600">
                  {signInResponse?.data?.user?.email}{" "}
                </p>
              </div>
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
            {/* <DropdownMenuGroup>
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
            </DropdownMenuGroup> */}
            {signInResponse !== null && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
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
            "flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded-full px-6 py-3 transition-transform transform hover:scale-105 hover:shadow-xl"
          )}
        >
          <LogIn className="w-5 h-5" />
          Login
        </Link>
      )}
    </>
  );
}
