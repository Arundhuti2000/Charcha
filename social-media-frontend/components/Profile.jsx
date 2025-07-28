import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Calendar, Phone, Mail, Edit3, Trash2 } from 'lucide-react'
import api from '../services/api'
import PostCard from './PostCard'

const Profile = () => {
  const { user } = useAuth()
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalVotes: 0,
    totalUpvotes: 0,
    totalDownvotes: 0
  })

  useEffect(() => {
    fetchUserPosts()
  }, [])

  const fetchUserPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/posts/profileposts', {
        params: {
          limit: 50,
          skip: 0
        }
      })
      
      setUserPosts(response.data)
      
      // Calculate stats
      const totalPosts = response.data.length
      const totalVotes = response.data.reduce((sum, post) => sum + post.Votes, 0)
      const totalUpvotes = response.data.reduce((sum, post) => sum + post.Upvotes, 0)
      const totalDownvotes = response.data.reduce((sum, post) => sum + post.Downvotes, 0)
      
      setStats({
        totalPosts,
        totalVotes,
        totalUpvotes,
        totalDownvotes
      })
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await api.delete(`/posts/${postId}`)
      setUserPosts(prev => prev.filter(post => post.Post.id !== postId))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPosts: prev.totalPosts - 1
      }))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  const handleVoteUpdate = (postId, newVotes) => {
    setUserPosts(prev => prev.map(post => 
      post.Post.id === postId 
        ? { ...post, Votes: newVotes.total, Upvotes: newVotes.upvotes, Downvotes: newVotes.downvotes }
        : post
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
        {/* Cover Background */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"></div>
        
        {/* Profile Content */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-12">
            {/* Profile Picture */}
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            
            {/* User Info */}
            <div className="flex-1 sm:mt-4">
              <h1 className="text-2xl font-bold text-gray-900">{user?.email}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone_number && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user?.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalPosts}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.totalVotes}</div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalUpvotes}</div>
            <div className="text-sm text-gray-600">Upvotes</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.totalDownvotes}</div>
            <div className="text-sm text-gray-600">Downvotes</div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">My Posts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {stats.totalPosts} {stats.totalPosts === 1 ? 'post' : 'posts'} published
          </p>
        </div>

        <div className="p-6">
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">You haven't created any posts yet. Start sharing your thoughts!</p>
              <a
                href="/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Post
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <div key={post.Post.id} className="relative">
                  {/* Post Actions */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-md p-2">
                      <button
                        onClick={() => {/* TODO: Implement edit functionality */}}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit post"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.Post.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <PostCard 
                    post={post} 
                    onVoteUpdate={handleVoteUpdate}
                    showFullContent={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile