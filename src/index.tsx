import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import "the-new-css-reset";
import "./index.module.scss";

import { Nav } from "./components/_index";
import LandingPage from "./pages/LandingPage";
import StyleguidePage from "./pages/StyleguidePage";

const Root = (): JSX.Element => {
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
        path: "/",
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
