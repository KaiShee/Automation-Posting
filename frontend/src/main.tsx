import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AppLayout } from './ui/AppLayout'
import { LandingPage } from './routes/LandingPage'
import { SharePage } from './routes/SharePage'
import { ThankYouPage } from './routes/ThankYouPage'
import { AdminPage } from './routes/AdminPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'share', element: <SharePage /> },
      { path: 'thanks', element: <ThankYouPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)



