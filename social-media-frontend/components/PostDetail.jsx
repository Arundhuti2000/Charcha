import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PostCard from './PostCard'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/posts/${id}`)
      setPost(response.data)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error.response?.data?.detail || 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleVoteUpdate = (postId, newVotes) => {
    if (post && post.Post.id === postId) {
      setPost(prev => ({
        ...prev,
        Votes: newVotes.total,
        Upvotes: newVotes.upvotes,
        Downvotes: newVotes.downvotes
      }))
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/posts/${id}`)
      navigate('/')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const isOwner = user && user.id === post.Post.user_id

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Post Actions (if owner) */}
        {isOwner && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* TODO: Implement edit functionality */}}
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit post"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDeletePost}
              className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-8">
        <PostCard 
          post={post} 
          onVoteUpdate={handleVoteUpdate}
          showFullContent={true}
        />
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        </div>
        
        <div className="p-6">
          {/* Comment Form */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600">Comments feature coming soon!</p>
              <p className="text-sm text-gray-500 mt-1">
                We're working on adding the ability to comment on posts.
              </p>
            </div>
          </div>

          {/* Comments List Placeholder */}
          <div className="space-y-4">
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500">No comments yet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Related Posts</h3>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-600">Related posts feature coming soon!</p>
            <p className="text-sm text-gray-500 mt-1">
              We'll show you similar posts based on category and content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetail