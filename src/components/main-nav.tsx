import { Link, NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-6 p-2 bg-white shadow-md rounded-lg",
        className
      )}
      {...props}
    >
      <NavLink
        to="/boards"
        className={({ isActive, isPending }) =>
          cn(
            "px-4 py-2 rounded-md transition-colors",
            isPending
              ? "text-gray-400"
              : isActive
              ? "text-white bg-green-400"
              : "text-gray-700 hover:bg-gray-100"
          )
        }
      >
        Boards
      </NavLink>
      <NavLink
        to="/upload"
        className={({ isActive, isPending }) =>
          cn(
            "px-4 py-2 rounded-md transition-colors",
            isPending
              ? "text-gray-400"
              : isActive
              ? "text-white bg-green-400"
              : "text-gray-700 hover:bg-gray-100"
          )
        }
      >
        Upload
      </NavLink>
    </nav>
  );
}
