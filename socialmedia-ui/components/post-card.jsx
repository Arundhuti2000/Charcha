"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronUp, ChevronDown, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function PostCard({ post, currentUserId, onVote, onDelete }) {
  const [userVote, setUserVote] = useState(null)
  const isOwner = post.owner.id === currentUserId

  const handleUpvote = () => {
    const newVote = userVote === 1 ? 0 : 1
    setUserVote(newVote === 0 ? null : newVote)
    onVote(post.id, newVote)
  }

  const handleDownvote = () => {
    const newVote = userVote === -1 ? 0 : -1
    setUserVote(newVote === 0 ? null : newVote)
    onVote(post.id, newVote)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{post.owner.email.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.owner.email}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{post.category}</Badge>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        {post.rating && (
          <div className="mt-2">
            <Badge variant="outline">Rating: {post.rating}/5</Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1">
            <Button
              variant={userVote === 1 ? "default" : "ghost"}
              size="sm"
              onClick={handleUpvote}
              className="flex items-center space-x-1"
            >
              <ChevronUp className="h-4 w-4" />
              <span>{post.Upvotes}</span>
            </Button>

            <Button
              variant={userVote === -1 ? "destructive" : "ghost"}
              size="sm"
              onClick={handleDownvote}
              className="flex items-center space-x-1"
            >
              <ChevronDown className="h-4 w-4" />
              <span>{post.Downvotes}</span>
            </Button>
          </div>

          <div className="text-sm text-gray-500">{post.Votes} total votes</div>
        </div>
      </CardFooter>
    </Card>
  )
}
