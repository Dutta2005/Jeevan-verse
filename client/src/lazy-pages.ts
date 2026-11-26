import { lazy } from "react";

// Lazy load components
export const App = lazy(() => import("./App"));
export const Home = lazy(() => import("./pages/Home"));
export const Error404 = lazy(() => import("./components/errors/Error404"));
export const MedicalChatbot = lazy(() => import("./pages/Chatbot"));
export const BloodBridge = lazy(() => import("./pages/BloodBridge"));
export const BloodBridgeRequest = lazy(() => import("./pages/BloodBridgeRequest"));
export const OrgPostPage = lazy(() => import("./pages/organisation/OrgPostPage"));
export const DiscussionsPage = lazy(() => import("./pages/Discussions"));
export const DiscussionPost = lazy(() => import("./components/discussion/DiscussionPost"));
export const OrgPost = lazy(() => import("./pages/organisation/OrgPost"));
export const PostForm = lazy(() => import("./components/organisation/post/PostForm"));
export const Layout = lazy(() => import("./pages/organisation/Layout"));
export const OrgHome = lazy(() => import("./pages/organisation/OrgHome"));
export const Login = lazy(() => import("./pages/account/Login"));
export const Signup = lazy(() => import("./pages/account/Signup"));
export const OrganizationSignup = lazy(
  () => import("./pages/organisation/auth/OrganisationSignup"),
);
export const OrganizationLogin = lazy(() => import("./pages/organisation/auth/OrganisationLogin"));
export const OrgProfile = lazy(() => import("./pages/organisation/OrgProfile"));
export const NotificationPage = lazy(() => import("./pages/account/NotificationPage"));
