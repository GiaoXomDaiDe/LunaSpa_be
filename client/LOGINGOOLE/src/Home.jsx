import { Link, useNavigate } from 'react-router-dom'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

const getGoogleAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env
  const url = `https://accounts.google.com/o/oauth2/v2/auth`
  const query = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(
      ' '
    ),
    prompt: 'consent',
    access_type: 'offline'
  }
  const queryString = new URLSearchParams(query).toString()
  return `${url}?${queryString}`
}
const googleOAuthUrl = getGoogleAuthUrl()
const getFacebookAuthUrl = () => {
  const { VITE_FACEBOOK_CLIENT_ID, VITE_FACEBOOK_REDIRECT_URI } = import.meta.env
  const url = `https://www.facebook.com/v22.0/dialog/oauth`
  const query = {
    client_id: VITE_FACEBOOK_CLIENT_ID,
    redirect_uri: VITE_FACEBOOK_REDIRECT_URI,
    response_type: 'code',
    auth_type: 'rerequest',
    state: '12345huydeptrai',
    scope: ['email', 'public_profile'].join(' ')
  }

  const queryString = new URLSearchParams(query).toString()
  return `${url}?${queryString}`
}
const facebookOAuthUrl = getFacebookAuthUrl()

export default function Home() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
  }
  const navigate = useNavigate()

  return (
    <>
      <div>
        <span>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </span>
        <span>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </span>
      </div>
      <h1>Luna Spa - Quản lý lịch làm việc</h1>
      <div className='read-the-docs'>
        {isAuthenticated ? (
          <>
            <span>Bạn đã đăng nhập thành công.</span>
            <button onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <div>
            <Link to={googleOAuthUrl}>Đăng nhập bằng Google</Link>
            <Link to={facebookOAuthUrl}>Đăng nhập bằng Facebook</Link>
          </div>
        )}
      </div>

      <div className='card'>
        <button onClick={() => navigate('/login')}>Đi đến trang Đăng nhập</button>
      </div>

      <div className='card'>
        <button onClick={() => navigate('/staff-schedule')}>Xem lịch làm việc nhân viên</button>
      </div>

      <p className='read-the-docs'>Copyright © 2023 Luna Spa</p>
    </>
  )
}
