import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { PersistGate } from "redux-persist/integration/react"
import { persistStore } from "redux-persist"
import { Toaster } from './components/ui/toaster.tsx'
import Protected from './components/layouts/Protected.tsx'
import PublicRoutes from './components/layouts/Public.tsx'
import Layout from './pages/organisation/Layout.tsx'
import LoadingScreen from './components/LoadingScreen.tsx'

// Eager load protected route components
import MedicalChatbot from './pages/Chatbot.tsx'
import OrgPostPage from './pages/organisation/OrgPostPage.tsx'
import DiscussionsPage from './pages/Discussions.tsx'
import PostForm from './components/organisation/post/PostForm.tsx'
import BloodBridge from './pages/BloodBridge.tsx'
import BloodBridgeRequest from './pages/BloodBridgeRequest.tsx'



const Home = lazy(() => import('./pages/Home.tsx'))
const Error404 = lazy(() => import('./components/errors/Error404.tsx'))
const DiscussionPost = lazy(() => import('./components/discussion/DiscussionPost.tsx'))
const OrgPost = lazy(() => import('./pages/organisation/OrgPost.tsx'))
const Signup = lazy(() => import('./pages/account/Signup.tsx'))
const Login = lazy(() => import('./pages/account/Login.tsx'))
const OrganizationSignup = lazy(() => import('./pages/organisation/auth/OrganisationSignup.tsx'))
const OrganizationLogin = lazy(() => import('./pages/organisation/auth/OrganisationLogin.tsx'))
const OrgHome = lazy(() => import('./pages/organisation/OrgHome.tsx'))

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Error404 />
          </Suspense>
        )
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
          </Protected>)
      },
      {
        path: 'bloodbridge/request/:id',
        element: (
          <Protected role="user">
            <BloodBridgeRequest />
          </Protected>)
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
      }
    ]
  },
  {
    path: 'organisation',
    element: <Layout />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <OrgHome />
          </Suspense>
        )
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Error404 />
          </Suspense>
        )
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
        <Suspense fallback={<LoadingScreen />}>
          <Login />
        </Suspense>
      </PublicRoutes>
    )
  },
  {
    path: 'signup',
    element: (
      <PublicRoutes role="user">
        <Suspense fallback={<LoadingScreen />}>
          <Signup />
        </Suspense>
      </PublicRoutes>
    )
  },
  {
    path: 'register',
    element: (
      <PublicRoutes role="organization">
        <Suspense fallback={<LoadingScreen />}>
          <OrganizationSignup />
        </Suspense>
      </PublicRoutes>
    )
  },
  {
    path: 'signin',
    element: (
      <PublicRoutes role="organization">
        <Suspense fallback={<LoadingScreen />}>
          <OrganizationLogin />
        </Suspense>
      </PublicRoutes>
    )
  }
])

let persistor = persistStore(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster />
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)