"use client"

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="error-banner">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
        <button className="error-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  )
}

export default ErrorMessage
