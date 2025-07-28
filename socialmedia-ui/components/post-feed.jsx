"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function PostFeed({ token, currentUserId }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/posts/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
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
        // Refresh posts to get updated vote counts
        fetchPosts()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (posts.length === 0) {
    return <div className="text-center py-8 text-gray-500">No posts yet. Be the first to share something!</div>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onVote={handleVote}
          onDelete={handleDeletePost}
        />
      ))}
    </div>
  )
}
