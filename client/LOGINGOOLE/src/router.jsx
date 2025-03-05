import { createBrowserRouter } from 'react-router-dom'
import Home from './Home'
import Login from './Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login/oauth-google',
    element: <Login />
  },
  {
    path: '/login/oauth-facebook',
    element: <Login />
  }
])

export default router
