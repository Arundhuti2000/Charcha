"use client"

const Sidebar = ({ user, activeTab, setActiveTab }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="sidebar">
      <div className="sidebar-card">
        <nav className="nav">
          <button className={`nav-button ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>
            🏠 Home
          </button>
          <button
            className={`nav-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Posts
          </button>
          <button
            className={`nav-button ${activeTab === "trending" ? "active" : ""}`}
            onClick={() => setActiveTab("trending")}
          >
            📈 Trending
          </button>
          <button
            className={`nav-button ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            🔖 Saved
          </button>
        </nav>

        <div className="user-info">
          <div className="avatar large">{user.email[0].toUpperCase()}</div>
          <div className="user-details">
            <p className="user-email">{user.email}</p>
            <p className="user-joined">Joined {formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
