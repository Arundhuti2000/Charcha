"use client"

const CreatePostModal = ({ newPost, setNewPost, onSubmit, onClose, loading }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="create-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Give your post a catchy title..."
              required
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Share your thoughts..."
              rows={4}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}>
                <option value="general">General</option>
                <option value="tech">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="business">Business</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rating (1-5)</label>
              <select
                value={newPost.rating || ""}
                onChange={(e) =>
                  setNewPost({ ...newPost, rating: e.target.value ? Number.parseInt(e.target.value) : null })
                }
              >
                <option value="">Optional</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newPost.published}
                onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })}
              />
              Publish immediately
            </label>
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreatePostModal
