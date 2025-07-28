"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { PostFeed } from "@/components/post-feed"
import { CreatePost } from "@/components/create-post"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, PlusCircle, LogOut } from "lucide-react"

export default function SocialMediaApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [activeTab, setActiveTab] = useState("feed")

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (token, user) => {
    setToken(token)
    setUser(user)
    setIsAuthenticated(true)
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">SocialHub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <PostFeed token={token} currentUserId={user.id} />
          </TabsContent>

          <TabsContent value="create">
            <CreatePost token={token} onPostCreated={() => setActiveTab("feed")} />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile token={token} user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
