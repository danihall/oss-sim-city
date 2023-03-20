import React from "react";
import { createRoot } from "react-dom/client";
//import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import "the-new-css-reset";
import "./index.module.scss";

import { Nav } from "./components/Nav/Nav";
import LandingPage from "./pages/LandingPage/LandingPage";
import StyleguidePage from "./pages/StyleguidePage/StyleguidePage";

const Root = () => {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        element: <LandingPage />,
      },
      {
        path: "styleguide",
        element: <StyleguidePage />,
      },
    ],
  },
]);

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
