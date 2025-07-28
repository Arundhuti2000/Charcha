"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import CreatePostCard from "./components/CreatePostCard"
import CreatePostModal from "./components/CreatePostModal"
import PostCard from "./components/PostCard"
import LoginForm from "./components/LoginForm"
import LoadingSpinner from "./components/LoadingSpinner"
import ErrorMessage from "./components/ErrorMessage"
import { authAPI, postsAPI, usersAPI, voteAPI } from "./services/api"
import "./App.css"

const App = () => {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("home")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    published: true,
    rating: null,
  })

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          const userData = await usersAPI.getCurrentUser()
          setUser(userData)
          await loadPosts()
        } catch (error) {
          console.error("Auth check failed:", error)
          authAPI.logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Load posts from API
  const loadPosts = async () => {
    try {
      setError(null)
      const postsData = await postsAPI.getAllPosts()
      setPosts(postsData)
    } catch (error) {
      setError("Failed to load posts: " + error.message)
      console.error("Failed to load posts:", error)
    }
  }

  // Handle user login
  const handleLogin = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      // Login and get token
      await authAPI.login(email, password)

      // Get user data
      const userData = await usersAPI.getCurrentUser()
      setUser(userData)

      // Load posts
      await loadPosts()
    } catch (error) {
      setError("Login failed: " + error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Handle user registration
  const handleRegister = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      // Register user
      await authAPI.register(email, password)

      // Auto-login after registration
      await handleLogin(email, password)
    } catch (error) {
      setError("Registration failed: " + error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Handle user logout
  const handleLogout = () => {
    authAPI.logout()
    setUser(null)
    setPosts([])
    setActiveTab("home")
  }

  // Handle create post
  const handleCreatePost = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setLoading(true)

      // Create post via API
      const createdPost = await postsAPI.createPost(newPost)

      // Add new post to the beginning of posts array
      setPosts([createdPost, ...posts])

      // Reset form and close modal
      setNewPost({ title: "", content: "", category: "general", published: true, rating: null })
      setShowCreatePost(false)
    } catch (error) {
      setError("Failed to create post: " + error.message)
      console.error("Failed to create post:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle vote on post
  const handleVote = async (postId, direction) => {
    try {
      setError(null)

      // Send vote to API
      await voteAPI.votePost(postId, direction)

      // Reload posts to get updated vote counts
      await loadPosts()
    } catch (error) {
      setError("Failed to vote: " + error.message)
      console.error("Failed to vote:", error)
    }
  }

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      setError(null)

      // Delete post via API
      await postsAPI.deletePost(postId)

      // Remove post from local state
      setPosts(posts.filter((post) => post.id !== postId))
    } catch (error) {
      setError("Failed to delete post: " + error.message)
      console.error("Failed to delete post:", error)
    }
  }

  // Load user's own posts
  const loadOwnPosts = async () => {
    try {
      setError(null)
      setLoading(true)
      const ownPosts = await postsAPI.getOwnPosts()
      setPosts(ownPosts)
    } catch (error) {
      setError("Failed to load your posts: " + error.message)
      console.error("Failed to load own posts:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === "home") {
      loadPosts()
    } else if (tab === "profile") {
      loadOwnPosts()
    }
  }

  if (loading && !user) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div>
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
        <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
      </div>
    )
  }

  return (
    <div className="app">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <Header user={user} onLogout={handleLogout} />

      <div className="main-container">
        <div className="layout">
          <Sidebar user={user} activeTab={activeTab} setActiveTab={handleTabChange} />

          <div className="content">
            <CreatePostCard onShowModal={() => setShowCreatePost(true)} />

            {showCreatePost && (
              <CreatePostModal
                newPost={newPost}
                setNewPost={setNewPost}
                onSubmit={handleCreatePost}
                onClose={() => setShowCreatePost(false)}
                loading={loading}
              />
            )}

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="posts-feed">
                {posts.length === 0 ? (
                  <div className="no-posts">
                    <p>No posts found. Be the first to create one!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={user}
                      onVote={handleVote}
                      onDelete={handleDeletePost}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
