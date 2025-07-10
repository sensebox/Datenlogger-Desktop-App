import { Outlet } from "react-router-dom";
import { MainNav } from "../components/main-nav";
import { UserNav } from "../components/user-nav";
import BoardSwitcher from "@/components/board-switcher";
import AuthProvider from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-center" richColors/>
    </AuthProvider>
  );
}
