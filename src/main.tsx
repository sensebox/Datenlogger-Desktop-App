import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import ProtectedRoute from "./components/protected-route";

import Root from "./routes/root";
import ErrorPage from "./error-page";

import Upload from "./routes/upload";
import Boards from "./routes/boards";
import Login from "./routes/login";

import "./styles.css";
import Folder from "./routes/folder";
import Arduino from "./routes/Arduino";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/boards" />,
      },
      {
        path: "boards",
        element: <Boards />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "upload",
        element: (
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ":folderId",
            element: <Folder />,
          },
        ],
      },
      {
        path: "arduino",
        element: <Arduino />,
      },
      {
        path: "*",
        element: <Navigate to="/boards" replace />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
