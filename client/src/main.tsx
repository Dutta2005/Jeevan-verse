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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
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
