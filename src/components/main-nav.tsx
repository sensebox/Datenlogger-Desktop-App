

import { Link, NavLink } from "react-router-dom"
import { cn } from "../lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <NavLink
        to="/boards"
        className={({ isActive, isPending }) =>
          isPending ? "text-muted-foreground" : isActive ? "text-green-400" : ""
        }
      >
        Boards
      </NavLink>
      <NavLink
        to="/upload"
        className={({ isActive, isPending }) =>
          isPending ? "text-muted-foreground" : isActive ? "text-green-400" : ""
        }
      >
        Upload
      </NavLink>
    </nav>
  )
}