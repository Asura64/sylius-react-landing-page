import { useEffect } from 'react'
import {
  Outlet,
  createBrowserRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { CoursePage } from './pages/Course'
import { LandingPage } from './pages/LandingPage'

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const scrollToTarget = () => {
      const target = document.getElementById(location.hash.slice(1))

      if (!target) {
        return
      }

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }

    window.requestAnimationFrame(scrollToTarget)
  }, [location.hash, location.pathname])

  return null
}

function AppLayout() {
  return (
    <>
      <ScrollToHash />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/cours/sylius/:courseSlug',
        element: <CoursePage />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
