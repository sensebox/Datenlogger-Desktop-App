import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import ProtectedRoute from "./components/protected-route";

import Root from "./routes/root";
import ErrorPage from "./error-page";

import Upload from "./routes/upload";
import Boards from "./routes/boards";
import Login from "./routes/login";


import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "login",
        element: <Login />
      },
      {
        path: "boards",
        element: <Boards />
      },
      {
        path: "upload",
        element: <ProtectedRoute>
          <Upload />
        </ProtectedRoute> ,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>
);
