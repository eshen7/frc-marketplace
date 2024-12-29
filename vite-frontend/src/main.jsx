import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MakeRequest from "./pages/MakeRequest";
import Fulfill from "./pages/Fulfill";
import AllRequests from "./pages/AllRequests.jsx";
import SalesPage from "./pages/AllSales.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import UserProfile from "./pages/Profile.jsx";
import PublicProfilePage from "./pages/PublicProfile.jsx";
import Chat from "./pages/Messaging.jsx";
import PartDetails from "./pages/Part.jsx";

const ErrorPage = () => <p> Sorry, this page does not exist</p>;

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "request",
          element: <MakeRequest />,
        },
        {
          path: "requests/:request_id",
          element: <Fulfill />,
        },
        {
          path: "requests",
          element: <AllRequests />,
        },
        {
          path: "sales",
          element: <SalesPage />,
        },
        {
          path: "landingPage",
          element: <LandingPage />,
        },
        {
          path: "profile",
          element: <UserProfile />,
        },
        {
          path: "profile/frc/:teamNumber",
          element: <PublicProfilePage />,
        },
        {
          path: "part/:id",
          element: <PartDetails />,
        },
        {
          path: "/chat/",
          element: <Chat />,
        },
        {
          path: "/chat/:roomName",
          element: <Chat />,
        },
        {
          path: "*",
          element: <p>Page not found</p>,
        },
      ],
    },
  ],
  {
    future: {
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_startTransition: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// initializes root if root hasn't been created yet --- only time createRoot should be called
let root;
if (!rootElement._reactRoot) {
  root = createRoot(rootElement);
  rootElement._reactRoot = root; // marks root as initialized
}

//render application
const renderApp = () => {
  if (root) {
    root.render(
      <StrictMode>
        <ThemeProvider theme={theme}>
          <RouterProvider
            router={router}
            future={{
              v7_partialHydration: true,
              v7_relativeSplatPath: true,
              v7_startTransition: true,
              v7_fetcherPersist: true,
              v7_normalizeFormMethod: true,
              v7_skipActionErrorRevalidation: true,
            }}
          />
        </ThemeProvider>
      </StrictMode>
    );
  }
};
//initial application rendering
renderApp();

//hmr
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    //re renders the app on module replacement
    renderApp();
  });
}
