import { createBrowserRouter, Navigate } from "react-router";
import Protected from "./components/layouts/Protected";
import PublicRoutes from "./components/layouts/Public";
import BloodDonationGuidelines from "./pages/BloodDonationGuidelines.js";

import {
  App,
  Home,
  Error404,
  MedicalChatbot,
  BloodBridge,
  BloodBridgeRequest,
  OrgPostPage,
  DiscussionsPage,
  DiscussionPost,
  OrgPost,
  PostForm,
  Layout,
  OrgHome,
  Login,
  Signup,
  OrganizationSignup,
  OrganizationLogin,
  OrgProfile,
  NotificationPage,
} from "./lazy-pages";

import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { store } from "./store/store.js";
import "./index.css";
import { Toaster } from "./components/ui/toaster.js";
import LoadingScreen from "./components/LoadingScreen.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "*",
        element: <Error404 />,
      },
      {
        path: "chatbot",
        element: (
          <Protected role="user">
            <MedicalChatbot />
          </Protected>
        ),
      },
      {
        path: "bloodbridge",
        element: (
          <Protected role="user">
            <BloodBridge />
          </Protected>
        ),
      },
      {
        path: "bloodbridge/request/:id",
        element: (
          <Protected role="user">
            <BloodBridgeRequest />
          </Protected>
        ),
      },
      {
        path: "bloodbridge/guidelines",
        element: <BloodDonationGuidelines />,
      },
      {
        path: "notifications",
        element: (
          <Protected role="user">
            <NotificationPage />
          </Protected>
        ),
      },
      {
        path: "posts",
        element: (
          <Protected role="user">
            <Navigate to="/discussions?type=organization" replace />
          </Protected>
        ),
      },
      {
        path: "post/:id",
        element: <OrgPost />,
      },
      {
        path: "discussions",
        element: (
          <Protected role="user">
            <DiscussionsPage />
          </Protected>
        ),
      },
      {
        path: "discussions/:id",
        element: <DiscussionPost />,
      },
      { path: "org-profile/:id", element: <OrgProfile /> },
    ],
  },
  {
    path: "organisation",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <OrgHome />,
        children: [
          {
            path: "create",
            element: (
              <Protected role="organization">
                <PostForm />
              </Protected>
            ),
          },
        ],
      },
      { path: "org-profile/:id", element: <OrgProfile /> },
      {
        path: "*",
        element: <Error404 />,
      },
      {
        path: "posts",
        element: (
          <Protected role="organization">
            <OrgPostPage />
          </Protected>
        ),
      },
      {
        path: "post/:id",
        element: <OrgPost />,
      },
      {
        path: "edit/:id",
        element: (
          <Protected role="organization">
            <PostForm />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "login",
    element: (
      <PublicRoutes role="user">
        <Login />
      </PublicRoutes>
    ),
  },
  {
    path: "signup",
    element: (
      <PublicRoutes role="user">
        <Signup />
      </PublicRoutes>
    ),
  },
  {
    path: "register",
    element: (
      <PublicRoutes role="organization">
        <OrganizationSignup />
      </PublicRoutes>
    ),
  },
  {
    path: "signin",
    element: (
      <PublicRoutes role="organization">
        <OrganizationLogin />
      </PublicRoutes>
    ),
  },
]);

const persistor = persistStore(store);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Toaster />
        <Suspense fallback={<LoadingScreen />}>
          <RouterProvider router={router} />
        </Suspense>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
