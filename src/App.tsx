import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import AuthProvider from "./components/auth-provider";
import { Route, Routes } from "react-router-dom";
import Boards from "./routes/boards";
import ProtectedRoute from "./components/protected-route";
import Upload from "./routes/upload";
import { MainNav } from "./components/main-nav";
import Login from "./routes/login";
import BoardSwitcher from "./components/board-switcher";
import { UserNav } from "./components/user-nav";
import ErrorPage from "./error-page";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <AuthProvider>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <BoardSwitcher />
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
      </div>

      <Routes>
        <Route index element={<Boards />} errorElement={<ErrorPage />} />
        <Route
          path="boards"
          element={<Boards />}
          errorElement={<ErrorPage />}
        />
        <Route path="login" element={<Login />} errorElement={<ErrorPage />} />
        <Route
          path="upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
          errorElement={<ErrorPage />}
        />
        <Route
          path="arduino"
          element={<Arduino />}
          errorElement={<ErrorPage />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
