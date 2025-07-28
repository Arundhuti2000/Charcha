"use client"

import { useState } from "react"

const LoginForm = ({ onLogin, onRegister }) => {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onLogin(loginForm.email, loginForm.password)
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onRegister(registerForm.email, registerForm.password)
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">❤️</span>
          </div>
          <h1 className="app-title">SocialHub</h1>
          <p className="app-subtitle">Connect, Share, Inspire</p>
        </div>

        <div className="auth-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`tab-button ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginForm
