"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function UserProfile({ token, user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUserPosts()
  }, [])

  const fetchUserPosts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/posts/profileposts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user posts")
      }

      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (postId, direction) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: postId,
          dir: direction,
        }),
      })

      if (response.ok) {
        fetchUserPosts()
      }
    } catch (err) {
      console.error("Failed to vote:", err)
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
      }
    } catch (err) {
      console.error("Failed to delete post:", err)
    }
  }

  const totalVotes = posts.reduce((sum, post) => sum + post.Votes, 0)
  const totalUpvotes = posts.reduce((sum, post) => sum + post.Upvotes, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-lg font-medium">{user.email}</p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{posts.length} Posts</Badge>
              <Badge variant="outline">{totalVotes} Total Votes</Badge>
              <Badge variant="outline">{totalUpvotes} Upvotes Received</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">You haven't created any posts yet.</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                onVote={handleVote}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
