import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PostCard from './PostCard'
import { Search, Filter, RefreshCw } from 'lucide-react'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [limit] = useState(10)
  const [hasMore, setHasMore] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPosts = async (searchTerm = '', isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await api.get('/posts/', {
        params: {
          search: searchTerm,
          limit: limit,
          skip: 0
        }
      })

      setPosts(response.data)
      setHasMore(response.data.length === limit)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadMorePosts = async () => {
    try {
      const response = await api.get('/posts/', {
        params: {
          search,
          limit: 10,
          skip: posts.length
        }
      })

      if (response.data.length > 0) {
        setPosts(prev => [...prev, ...response.data])
        setHasMore(response.data.length === 10)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPosts(search)
  }

  const handleRefresh = () => {
    fetchPosts(search, true)
  }

  const handleVoteUpdate = (postId, newVotes) => {
    setPosts(prev => prev.map(post => 
      post.Post.id === postId 
        ? { ...post, Votes: newVotes.total, Upvotes: newVotes.upvotes, Downvotes: newVotes.downvotes }
        : post
    ))
  }

  if (loading && !refreshing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Home Feed</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Create Post CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Share your thoughts</h2>
            <p className="text-blue-100">What's on your mind today?</p>
          </div>
          <Link
            to="/create"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Create Post
          </Link>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try adjusting your search terms' : 'Be the first to create a post!'}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard 
                key={post.Post.id} 
                post={post} 
                onVoteUpdate={handleVoteUpdate}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={loadMorePosts}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Load More Posts
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
  }

export default Home