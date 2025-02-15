import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Provider } from 'react-redux'
import { PersistGate } from "redux-persist/integration/react"
import { persistStore } from "redux-persist"
import { store } from './store/store.js'
import Protected from './components/layouts/Protected'
import PublicRoutes from './components/layouts/Public'
import './index.css'
import { Toaster } from './components/ui/toaster.js'
import LoadingScreen from './components/LoadingScreen.js'

// Lazy load components
const App = lazy(() => import('./App'))
const Home = lazy(() => import('./pages/Home'))
const Error404 = lazy(() => import('./components/errors/Error404'))
const MedicalChatbot = lazy(() => import('./pages/Chatbot'))
const BloodBridge = lazy(() => import('./pages/BloodBridge'))
const BloodBridgeRequest = lazy(() => import('./pages/BloodBridgeRequest'))
const OrgPostPage = lazy(() => import('./pages/organisation/OrgPostPage'))
const DiscussionsPage = lazy(() => import('./pages/Discussions'))
const DiscussionPost = lazy(() => import('./components/discussion/DiscussionPost'))
const OrgPost = lazy(() => import('./pages/organisation/OrgPost'))
const PostForm = lazy(() => import('./components/organisation/post/PostForm'))
const Layout = lazy(() => import('./pages/organisation/Layout'))
const OrgHome = lazy(() => import('./pages/organisation/OrgHome'))
const Login = lazy(() => import('./pages/account/Login'))
const Signup = lazy(() => import('./pages/account/Signup'))
const OrganizationSignup = lazy(() => import('./pages/organisation/auth/OrganisationSignup'))
const OrganizationLogin = lazy(() => import('./pages/organisation/auth/OrganisationLogin'))
const OrgProfile = lazy(() => import('./pages/organisation/OrgProfile'))
const NotificationPage = lazy(() => import('./pages/account/NotificationPage'))

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: '*',
        element: <Error404 />
      },
      {
        path: "chatbot",
        element: (
          <Protected role="user">
            <MedicalChatbot />
          </Protected>
        )
      },
      {
        path: 'bloodbridge',
        element: (
          <Protected role="user">
            <BloodBridge />
          </Protected>
        )
      },
      {
        path: 'bloodbridge/request/:id',
        element: (
          <Protected role="user">
            <BloodBridgeRequest />
          </Protected>
        )
      },
      {
        path: 'notifications',
        element: (
          <Protected role="user">
            <NotificationPage />
          </Protected>
        )
      },
      {
        path: 'posts',
        element: (
          <Protected role="user">
            <OrgPostPage />
          </Protected>
        )
      },
      { 
        path: 'post/:id', 
        element: <OrgPost /> 
      },
      {
        path: 'discussions',
        element: (
          <Protected role="user">
            <DiscussionsPage />
          </Protected>
        )
      },
      {
        path: 'discussions/:id',
        element: <DiscussionPost />
      },
      { path: 'org-profile/:id', element: <OrgProfile /> },
    ]
  },
  {
    path: 'organisation',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <OrgHome />
      },
      { path: 'org-profile/:id', element: <OrgProfile /> },
      {
        path: '*',
        element: <Error404 />
      },
      {
        path: 'posts',
        element: (
          <Protected role="organization">
            <OrgPostPage />
          </Protected>
        )
      },
      {
        path: 'post/:id',
        element: <OrgPost />
      },
      {
        path: 'create',
        element: (
          <Protected role="organization">
            <PostForm />
          </Protected>
        )
      },
      {
        path: 'edit/:id',
        element: (
          <Protected role="organization">
            <PostForm />
          </Protected>
        )
      }
    ]
  },
  {
    path: 'login',
    element: (
      <PublicRoutes role="user">
        <Login />
      </PublicRoutes>
    )
  },
  {
    path: 'signup',
    element: (
      <PublicRoutes role="user">
        <Signup />
      </PublicRoutes>
    )
  },
  {
    path: 'register',
    element: (
      <PublicRoutes role="organization">
        <OrganizationSignup />
      </PublicRoutes>
    )
  },
  {
    path: 'signin',
    element: (
      <PublicRoutes role="organization">
        <OrganizationLogin />
      </PublicRoutes>
    )
  }
])

let persistor = persistStore(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
          <Toaster />
          <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
          </Suspense>
      </PersistGate>
    </Provider>
  </StrictMode>
)