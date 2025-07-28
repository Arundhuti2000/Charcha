"use client"

const PostCard = ({ post, currentUser, onVote, onDelete }) => {
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
      tech: "tech-badge",
      lifestyle: "lifestyle-badge",
      general: "general-badge",
      business: "business-badge",
      entertainment: "entertainment-badge",
    }
    return colors[category] || colors.general
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      onDelete(post.id)
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="avatar">{post.owner.email[0].toUpperCase()}</div>
          <div>
            <p className="author-name">{post.owner.email}</p>
            <p className="post-date">{formatDate(post.created_at)}</p>
          </div>
        </div>
        <div className="post-badges">
          <span className={`badge ${getCategoryColor(post.category)}`}>{post.category}</span>
          {post.rating && <span className="badge rating-badge">{"⭐".repeat(post.rating)}</span>}
        </div>
      </div>

      <h2 className="post-title">{post.title}</h2>
      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <div className="vote-actions">
          <button className="vote-button upvote" onClick={() => onVote(post.id, 1)}>
            ⬆️ {post.upvotes || 0}
          </button>
          <button className="vote-button downvote" onClick={() => onVote(post.id, -1)}>
            ⬇️ {post.downvotes || 0}
          </button>
        </div>
        <div className="action-buttons">
          <button className="action-button">💬 Comment</button>
          <button className="action-button">🔗 Share</button>
        </div>
        {post.user_id === currentUser.id && (
          <div className="owner-actions">
            <button className="action-button">✏️</button>
            <button className="action-button delete" onClick={handleDelete}>
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostCard
