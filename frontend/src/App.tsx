import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { useAppSelector } from './store/hooks'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Explore from './pages/Explore'
import LoginPage from './pages/LoginPage'
import LineCallback from './pages/LineCallback'
import XCallback from './pages/XCallback'
import GoogleCallback from './pages/GoogleCallback'

const AppInner = (): React.JSX.Element => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
  const { pathname } = useLocation()

  if (pathname === '/auth/callback/line') {
    return <LineCallback />
  }

  if (pathname === '/auth/callback/x') {
    return <XCallback />
  }

  if (pathname === '/auth/callback/google') {
    return <GoogleCallback />
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Layout>
  )
}

const App = (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </Provider>
  )
}

export default App
