import React, { useEffect, useState } from 'react'
import { auth } from '../utils/apiwrapper';

// UI Components using Tailwind CSS
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }> = ({ 
  children, className = '', ...props 
}) => (
  <button 
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`} 
    {...props}
  >
    {children}
  </button>
)

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, className = '' 
}) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, className = '' 
}) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, className = '' 
}) => (
  <div className={`px-6 pt-6 ${className}`}>
    {children}
  </div>
)

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, className = '' 
}) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
)

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, className = '' 
}) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
)

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { className?: string }> = ({ 
  className = '', ...props 
}) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`} 
    {...props}
  />
)

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }> = ({ 
  children, className = '', ...props 
}) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
)

const Separator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`border-gray-200 ${className}`} />
)

type NetworkAnimationProps = object

const NetworkAnimation: React.FC<NetworkAnimationProps> = () => {
  const [activeConnections, setActiveConnections] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly activate connections from center to outer nodes
      const connections = Array.from({ length: 4 }, (_, i) => i).filter(() => Math.random() > 0.3)
      setActiveConnections(connections)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const centerNode = { x: 200, y: 200 }
  const outerNodes = [
    { x: 100, y: 100, id: 0 },
    { x: 300, y: 100, id: 1 },
    { x: 320, y: 280, id: 2 },
    { x: 80, y: 280, id: 3 },
  ]

  return (
    <div className="flex items-center justify-center h-full">
      <svg width="400" height="400" viewBox="0 0 400 400" className="w-full max-w-md">
        {/* Background circles for visual depth */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="150" fill="url(#bgGradient)" />

        {/* Connection lines */}
        {outerNodes.map((node, index) => (
          <line
            key={index}
            x1={centerNode.x}
            y1={centerNode.y}
            x2={node.x}
            y2={node.y}
            stroke={activeConnections.includes(index) ? "#3b82f6" : "#e5e7eb"}
            strokeWidth={activeConnections.includes(index) ? "3" : "2"}
            className={`transition-all duration-500 ${
              activeConnections.includes(index) ? "opacity-100" : "opacity-30"
            }`}
            filter={activeConnections.includes(index) ? "url(#glow)" : "none"}
          />
        ))}

        {/* Outer nodes (people) */}
        {outerNodes.map((node, index) => (
          <g key={index}>
            <circle
              cx={node.x}
              cy={node.y}
              r="20"
              fill={activeConnections.includes(index) ? "#3b82f6" : "#6b7280"}
              className={`transition-all duration-500 ${activeConnections.includes(index) ? "animate-pulse" : ""}`}
            />
            <circle cx={node.x} cy={node.y} r="12" fill="white" />
            {/* Simple person icon */}
            <circle cx={node.x} cy={node.y - 3} r="4" fill="#6b7280" />
            <path
              d={`M ${node.x - 6} ${node.y + 8} Q ${node.x} ${node.y + 2} ${node.x + 6} ${node.y + 8}`}
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
            />
          </g>
        ))}

        {/* Center node (Social Hub) */}
        <circle
          cx={centerNode.x}
          cy={centerNode.y}
          r="30"
          fill="url(#centerGradient)"
          className="animate-pulse"
          filter="url(#glow)"
        />
        <circle cx={centerNode.x} cy={centerNode.y} r="20" fill="white" />
        <text x={centerNode.x} y={centerNode.y + 5} textAnchor="middle" className="text-sm font-bold fill-blue-600">
          SH
        </text>

        {/* Animated pulse rings */}
        {activeConnections.length > 0 && (
          <>
            <circle
              cx={centerNode.x}
              cy={centerNode.y}
              r="30"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.6"
              className="animate-ping"
            />
            <circle
              cx={centerNode.x}
              cy={centerNode.y}
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              opacity="0.3"
              className="animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </svg>

      {/* Floating text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect with Everyone</h3>
        <p className="text-gray-600 text-sm">Join thousands of people sharing and connecting</p>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login attempt:', { email, password })
    const loginResult = await auth.login({ username: email, password: password });
    if (loginResult.data) {
        console.log('Login successful:', loginResult.data);
    }
  }

  const handleSignUpClick = () => {
    // Navigate to signup page
    console.log('Navigate to signup')
  }

  const handleForgotPasswordClick = () => {
    // Navigate to forgot password page
    console.log('Navigate to forgot password')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Animation */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10" />
        <NetworkAnimation />

        {/* Floating elements for extra visual appeal */}
        <div
          className="absolute top-20 left-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-60"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-32 w-2 h-2 bg-indigo-400 rounded-full animate-bounce opacity-60"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-16 w-4 h-4 bg-blue-300 rounded-full animate-bounce opacity-60"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 right-20 w-2 h-2 bg-indigo-300 rounded-full animate-bounce opacity-60"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">SH</span>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Social Hub</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Welcome back! Please sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium focus:outline-none focus:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-blue-500"
              >
                Sign In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">Or</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {"Don't have an account? "}
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors focus:outline-none focus:underline"
                >
                  Sign up
                </button>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage