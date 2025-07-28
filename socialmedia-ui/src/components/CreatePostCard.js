"use client"

const CreatePostCard = ({ onShowModal }) => {
  return (
    <div className="create-post-card">
      <button className="create-post-button" onClick={onShowModal}>
        ➕ What's on your mind?
      </button>
    </div>
  )
}

export default CreatePostCard
