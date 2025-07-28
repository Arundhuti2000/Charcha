"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Search,
  Bell,
  User,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  LogOut,
  Home,
  Bookmark,
} from "lucide-react"

export default function SocialMediaApp() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ email: "", password: "" })
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    published: true,
    rating: null,
  })

  // Mock data for demonstration
  const mockPosts = [
    {
      id: 1,
      title: "Just launched my new project! 🚀",
      content:
        "After months of hard work, I'm excited to share my latest creation with the world. It's been an incredible journey filled with challenges and learning experiences.",
      category: "tech",
      published: true,
      rating: 5,
      created_at: "2024-01-15T10:30:00Z",
      user_id: 1,
      owner: { id: 1, email: "john@example.com", created_at: "2024-01-01T00:00:00Z" },
      votes: 42,
      upvotes: 38,
      downvotes: 4,
    },
    {
      id: 2,
      title: "Beautiful sunset from my balcony 🌅",
      content:
        "Sometimes you need to pause and appreciate the simple beauty around us. This sunset reminded me why I love living in this city.",
      category: "lifestyle",
      published: true,
      rating: 4,
      created_at: "2024-01-14T18:45:00Z",
      user_id: 2,
      owner: { id: 2, email: "sarah@example.com", created_at: "2024-01-02T00:00:00Z" },
      votes: 28,
      upvotes: 26,
      downvotes: 2,
    },
    {
      id: 3,
      title: "Learning React has been amazing! 💻",
      content:
        "I've been diving deep into React for the past few weeks and I'm blown away by how powerful and elegant it is. The component-based architecture makes so much sense.",
      category: "tech",
      published: true,
      rating: 5,
      created_at: "2024-01-13T14:20:00Z",
      user_id: 3,
      owner: { id: 3, email: "mike@example.com", created_at: "2024-01-03T00:00:00Z" },
      votes: 15,
      upvotes: 14,
      downvotes: 1,
    },
  ]

  useEffect(() => {
    setPosts(mockPosts)
    // Simulate logged in user
    setUser({ id: 1, email: "john@example.com", created_at: "2024-01-01T00:00:00Z" })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setUser({ id: 1, email: loginForm.email, created_at: "2024-01-01T00:00:00Z" })
      setLoading(false)
    }, 1000)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setUser({ id: 1, email: registerForm.email, created_at: new Date().toISOString() })
      setLoading(false)
    }, 1000)
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const post = {
        ...newPost,
        id: posts.length + 1,
        created_at: new Date().toISOString(),
        user_id: user.id,
        owner: user,
        votes: 0,
        upvotes: 0,
        downvotes: 0,
      }
      setPosts([post, ...posts])
      setNewPost({ title: "", content: "", category: "general", published: true, rating: null })
      setLoading(false)
    }, 1000)
  }

  const handleVote = async (postId, direction) => {
    // Simulate API call to vote
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newUpvotes = direction === 1 ? post.upvotes + 1 : post.upvotes
          const newDownvotes = direction === -1 ? post.downvotes + 1 : post.downvotes
          return {
            ...post,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            votes: newUpvotes - newDownvotes,
          }
        }
        return post
      }),
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      tech: "bg-blue-100 text-blue-800",
      lifestyle: "bg-green-100 text-green-800",
      general: "bg-gray-100 text-gray-800",
      business: "bg-purple-100 text-purple-800",
      entertainment: "bg-pink-100 text-pink-800",
    }
    return colors[category] || colors.general
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SocialHub
            </h1>
            <p className="text-gray-600">Connect, Share, Inspire</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SocialHub
              </h1>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search posts..." className="pl-10" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={() => setUser(null)}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "home" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("home")}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Posts
                  </Button>
                  <Button
                    variant={activeTab === "trending" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("trending")}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending
                  </Button>
                  <Button
                    variant={activeTab === "saved" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("saved")}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved
                  </Button>
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">Joined {formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      What's on your mind?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          placeholder="Give your post a catchy title..."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          placeholder="Share your thoughts..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newPost.category}
                            onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="tech">Technology</SelectItem>
                              <SelectItem value="lifestyle">Lifestyle</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="rating">Rating (1-5)</Label>
                          <Select
                            value={newPost.rating?.toString() || ""}
                            onValueChange={(value) =>
                              setNewPost({ ...newPost, rating: value ? Number.parseInt(value) : null })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Star</SelectItem>
                              <SelectItem value="2">2 Stars</SelectItem>
                              <SelectItem value="3">3 Stars</SelectItem>
                              <SelectItem value="4">4 Stars</SelectItem>
                              <SelectItem value="5">5 Stars</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="published"
                          checked={newPost.published}
                          onCheckedChange={(checked) => setNewPost({ ...newPost, published: checked })}
                        />
                        <Label htmlFor="published">Publish immediately</Label>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating..." : "Create Post"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{post.owner.email[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.owner.email}</p>
                          <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                        {post.rating && <Badge variant="outline">{"⭐".repeat(post.rating)}</Badge>}
                      </div>
                    </div>

                    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(post.id, 1)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <ArrowUp className="w-4 h-4" />
                            <span className="ml-1">{post.upvotes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(post.id, -1)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ArrowDown className="w-4 h-4" />
                            <span className="ml-1">{post.downvotes}</span>
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>

                      {post.user_id === user.id && (
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
