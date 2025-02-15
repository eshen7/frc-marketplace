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
import PostSale from "./pages/PostSale";
import ViewRequest from "./pages/ViewRequest.jsx";
import ViewSale from "./pages/ViewSale.jsx";
import AllRequests from "./pages/AllRequests.jsx";
import SalesPage from "./pages/AllSales.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import UserProfile from "./pages/ProfileEditPage.jsx";
import PublicProfilePage from "./pages/PublicProfile.jsx";
import Chat from "./pages/Messaging.jsx";
import FooterAbout from "./pages/FooterLinks/FooterAbout";
import FooterFAQ from "./pages/FooterLinks/FooterFAQ";
import FooterPrivacy from "./pages/FooterLinks/FooterPrivacy";
import FooterTerms from "./pages/FooterLinks/FooterTerms";
import PartDetails from "./pages/Part.jsx";
import OurTeamPage from "./pages/FooterLinks/OurTeam.jsx";
import AllParts from "./pages/AllParts.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import Contact from "./pages/FooterLinks/Contact.jsx";
import Comp from "./pages/CompMode/Comp.jsx";
import CompSite from "./pages/CompMode/CompSite.jsx";
import CompAbout from "./pages/CompMode/CompAbout.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <PageNotFound error={"500"} />,
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
          path: "sale",
          element: <PostSale />,
        },
        {
          path: "requests/:request_id",
          element: <ViewRequest />,
        },
        {
          path: "sales/:sale_id",
          element: <ViewSale />,
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
          path: "landing-page",
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
          path: "parts/:id",
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
          path: "/footer/about",
          element: <FooterAbout />,
        },
        {
          path: "/footer/FAQ",
          element: <FooterFAQ />,
        },
        {
          path: "/footer/privacy",
          element: <FooterPrivacy />,
        },
        {
          path: "/footer/terms",
          element: <FooterTerms />,
        },
        {
          path: "/footer/ourteam",
          element: <OurTeamPage />,
        },
        {
          path: "/parts",
          element: <AllParts />,
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "/reset-password/:uidb64/:token",
          element: <ResetPassword />,
        },
        {
          path: "/footer/contact",
          element: <Contact />,
        },
        {
          path: "/comp",
          element: <Comp />,
        },
        {
          path: "/comp/:eventKey",
          element: <CompSite />,
        },
        {
          path: "/comp/about",
          element: <CompAbout />,
        },
        {
          path: "*",
          element: <PageNotFound error={"404"} />,
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
      // <StrictMode>
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
      // </StrictMode>
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
