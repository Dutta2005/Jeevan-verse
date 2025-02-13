import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { PersistGate } from "redux-persist/integration/react"
import { persistStore } from "redux-persist"
import { Toaster } from './components/ui/toaster.tsx'

import Signup from './pages/account/Signup.tsx'
import Login from './pages/account/Login.tsx'
import PublicRoutes from './components/layouts/Public.tsx'
import Home from './pages/Home.tsx'
import Error404 from './components/errors/Error404.tsx'
import OrganizationSignup from './pages/organisation/auth/OrganisationSignup.tsx'
import OrganizationLogin from './pages/organisation/auth/OrganisationLogin.tsx'
import Layout from './pages/organisation/Layout.tsx'
import OrgHome from './pages/organisation/OrgHome.tsx'
import Protected from './components/layouts/Protected.tsx'
import MedicalChatbot from './pages/Chatbot.tsx'
import DiscussionPost from './components/discussion/DiscussionPost.tsx'
import DiscussionsPage from './pages/Discussions.tsx'
import OrgPostPage from './pages/organisation/OrgPostPage.tsx'
import OrgPost from './pages/organisation/OrgPost.tsx'
import PostForm from './components/organisation/post/PostForm.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: '*', element: <Error404 /> },
      {
        path: "chatbot",
        element: <Protected role="user"><MedicalChatbot /></Protected>
      },
      { 
        path: 'discussions', 
        element: <Protected role="user"><DiscussionsPage /></Protected>,
        children: [
        ]
      },
      { path: 'discussions/:id', element: <DiscussionPost /> }
    ]
  },
  {
    path: 'organisation',
    element: <Layout />,
    children: [
      { path: '', element: <OrgHome /> },
      { path: '*', element: <Error404 /> },
      {
        path: 'posts', element: <Protected role="organization"><OrgPostPage /></Protected>
      },
      { path: 'post/:id', element: <OrgPost /> },
      { path: 'create', element: <Protected role="organization"><PostForm /></Protected> },
      { path: 'edit/:id', element: <Protected role="organization"><PostForm /></Protected> }
    ]
  },
  { 
    path: 'login',
    element: <PublicRoutes role="user"><Login /></PublicRoutes>
  },
  {
    path: 'signup',
    element: <PublicRoutes role="user"><Signup /></PublicRoutes>
  },
  { path: 'register', element: <PublicRoutes role="organization"><OrganizationSignup /></PublicRoutes> },
  { path: 'signin', element: <PublicRoutes role="organization"><OrganizationLogin /></PublicRoutes> },
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
