

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
        // className="text-sm font-medium transition-colors hover:text-primary"
      >
        Boards
      </NavLink>
      <NavLink
        to="/upload"
        className={({ isActive, isPending }) =>
          isPending ? "text-muted-foreground" : isActive ? "text-green-400" : ""
        }
        // className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Upload
      </NavLink>
    </nav>
  )
}