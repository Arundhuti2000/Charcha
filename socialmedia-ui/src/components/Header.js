"use client"

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">❤️</span>
          </div>
          <h1 className="app-title">SocialHub</h1>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Search posts..." className="search-input" />
        </div>

        <div className="header-right">
          <button className="icon-button">🔔</button>
          <div className="avatar">{user.email[0].toUpperCase()}</div>
          <button className="icon-button" onClick={onLogout}>
            🚪
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
