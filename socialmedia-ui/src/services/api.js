// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000" // Your FastAPI server URL

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("access_token")
}

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Authentication API calls
export const authAPI = {
  // POST /login
  login: async (email, password) => {
    const formData = new FormData()
    formData.append("username", email) // FastAPI expects 'username' field
    formData.append("password", password)

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      body: formData, // FastAPI login expects form data, not JSON
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Login failed")
    }

    const data = await response.json()
    // Store token in localStorage
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("token_type", data.token_type)
    return data
  },

  // POST /users/ (Register)
  register: async (email, password) => {
    return apiRequest("/users/", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    })
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
  },
}

// Posts API calls
export const postsAPI = {
  // GET /posts/ - Get All Posts
  getAllPosts: async () => {
    return apiRequest("/posts/")
  },

  // GET /posts/profileposts - Get Own Posts
  getOwnPosts: async () => {
    return apiRequest("/posts/profileposts")
  },

  // GET /posts/{id} - Get Single Post
  getPost: async (id) => {
    return apiRequest(`/posts/${id}`)
  },

  // POST /posts/ - Create Post
  createPost: async (postData) => {
    return apiRequest("/posts/", {
      method: "POST",
      body: JSON.stringify(postData),
    })
  },

  // PUT /posts/{id} - Update Post
  updatePost: async (id, postData) => {
    return apiRequest(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    })
  },

  // DELETE /posts/{id} - Delete Post
  deletePost: async (id) => {
    return apiRequest(`/posts/${id}`, {
      method: "DELETE",
    })
  },
}

// Users API calls
export const usersAPI = {
  // GET /users/ - Get Current User
  getCurrentUser: async () => {
    return apiRequest("/users/")
  },

  // GET /users/{id} - Get User by ID
  getUser: async (id) => {
    return apiRequest(`/users/${id}`)
  },
}

// Vote API calls
export const voteAPI = {
  // POST /vote - Vote on a post
  votePost: async (postId, direction) => {
    return apiRequest("/vote", {
      method: "POST",
      body: JSON.stringify({
        post_id: postId,
        dir: direction, // 1 for upvote, -1 for downvote
      }),
    })
  },
}
