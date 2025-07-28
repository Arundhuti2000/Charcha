import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, MessageSquare, Clock, User, Tag } from 'lucide-react'
import api from '../services/api'

const PostCard = ({ post, onVoteUpdate, showFullContent = false }) => {
  const [voting, setVoting] = useState(false)
  const [currentVote, setCurrentVote] = useState(null)

  const { Post: postData, Votes, Upvotes, Downvotes } = post

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    
    return date.toLocaleDateString()
  }

  const handleVote = async (direction) => {
    if (voting) return

    setVoting(true)
    try {
      await api.post('/vote/', {
        post_id: postData.id,
        dir: direction
      })

      // Update vote counts optimistically
      let newUpvotes = Upvotes
      let newDownvotes = Downvotes
      let newTotal = Votes

      if (currentVote === direction) {
        // Remove vote
        if (direction === 1) {
          newUpvotes = Upvotes - 1
        } else {
          newDownvotes = Downvotes - 1
        }
        newTotal = Votes - 1
        setCurrentVote(null)
      } else {
        // Add or change vote
        if (currentVote !== null) {
          // Changing from opposite vote
          if (currentVote === 1) {
            newUpvotes = Upvotes - 1
          } else {
            newDownvotes = Downvotes - 1
          }
          newTotal = Votes - 1
        }

        if (direction === 1) {
          newUpvotes = newUpvotes + 1
        } else {
          newDownvotes = newDownvotes + 1
        }
        newTotal = newTotal + 1
        setCurrentVote(direction)
      }

      if (onVoteUpdate) {
        onVoteUpdate(postData.id, {
          total: newTotal,
          upvotes: newUpvotes,
          downvotes: newDownvotes
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVoting(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Sports': 'bg-green-100 text-green-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'News': 'bg-red-100 text-red-800',
      'Lifestyle': 'bg-yellow-100 text-yellow-800',
      'Education': 'bg-indigo-100 text-indigo-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const truncateContent = (content, maxLength = 200) => {
    if (showFullContent || content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{postData.owner.email}</p>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <Clock className="h-3 w-3" />
                <span>{formatDate(postData.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(postData.category)}`}>
              <Tag className="h-3 w-3 inline mr-1" />
              {postData.category}
            </span>
            {postData.rating && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                ⭐ {postData.rating}/5
              </span>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
            {showFullContent ? (
              postData.title
            ) : (
              <Link 
                to={`/post/${postData.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {postData.title}
              </Link>
            )}
          </h2>
          
          <div className="text-gray-700 leading-relaxed">
            {truncateContent(postData.content)}
            {!showFullContent && postData.content.length > 200 && (
              <Link 
                to={`/post/${postData.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium ml-2"
              >
                Read more
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Vote Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote(1)}
                disabled={voting}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                  currentVote === 1
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                } disabled:opacity-50`}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm font-medium">{Upvotes}</span>
              </button>

              <button
                onClick={() => handleVote(-1)}
                disabled={voting}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                  currentVote === -1
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                } disabled:opacity-50`}
              >
                <ChevronDown className="h-4 w-4" />
                <span className="text-sm font-medium">{Downvotes}</span>
              </button>
            </div>

            {/* Comments */}
            <Link
              to={`/post/${postData.id}`}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Comment</span>
            </Link>
          </div>

          {/* Total Votes */}
          <div className="text-sm text-gray-500">
            {Votes} {Votes === 1 ? 'vote' : 'votes'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard