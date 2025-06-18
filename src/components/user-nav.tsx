import {
  LogIn,
  LogOut,
  Settings,
} from "lucide-react"
import * as React from "react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useAuth } from "./auth-provider"
import { cn } from "@/lib/utils"
import osmLogo from "@/assets/favicon.svg"

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()

export function UserNav() {
  const { signInResponse, onLogout } = useAuth()
  const user = signInResponse?.data.user

  // Nicht eingeloggt → Login-Link
  if (!user) {
    return (
      <Link
        to="/login"
        className={cn(
          "flex items-center gap-2",
          "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
          "shadow-lg rounded-full px-4 py-2",
          "hover:scale-105 transform transition"
        )}
      >
        <LogIn className="w-5 h-5" />
        Login
      </Link>
    )
  }

  // Eingeloggt → Dropdown mit Avatar + Name/Email
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="w-10 h-10">
            {/* Versuche erst das echte Bild, fallback auf Initialen */}
            <AvatarFallback className="bg-blue-200 text-blue-600">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium text-blue-600">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" align="end" forceMount>
        <DropdownMenuLabel className="px-4 py-2">
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
