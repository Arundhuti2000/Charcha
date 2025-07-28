import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, User, PlusCircle, LogOut, MessageCircle } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) return null

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SocialHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:block">Home</span>
            </Link>

            <Link
              to="/create"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/create') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:block">Create</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/profile') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block">Profile</span>
            </Link>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar