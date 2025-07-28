import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '../components/NavBar'
import Home from '../components/Home'
import Login from '../components/Login'
import Register from '../components/Register'
import Profile from '../components/Profile'
import CreatePost from '../components/CreatePost'
import PostDetail from '../components/PostDetail'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'  // Updated import
import './App.css'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/create" element={user ? <CreatePost /> : <Navigate to="/login" />} />
        <Route path="/post/:id" element={user ? <PostDetail /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App