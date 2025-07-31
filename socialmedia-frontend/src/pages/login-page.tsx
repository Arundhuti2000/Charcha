import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Users, MessageCircle, Heart, Share2 } from "lucide-react";
import { useIsAuthenticated, useLogin } from "@/api/hooks/useAuth";
import { toast } from "sonner";

const SocialHubLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginMutation = useLogin();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Animation state for floating icons
  const [animatedIcons, setAnimatedIcons] = useState([
    { id: 1, x: 20, y: 20, rotation: 0, opacity: 0.6 },
    { id: 2, x: 80, y: 60, rotation: 45, opacity: 0.4 },
    { id: 3, x: 40, y: 80, rotation: 90, opacity: 0.7 },
    { id: 4, x: 70, y: 30, rotation: 135, opacity: 0.5 },
  ]);

  // Animate floating icons
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIcons((prev) =>
        prev.map((icon) => ({
          ...icon,
          x: (icon.x + Math.sin(Date.now() * 0.001 + icon.id) * 0.5 + 100) % 100,
          y: (icon.y + Math.cos(Date.now() * 0.001 + icon.id) * 0.3 + 100) % 100,
          rotation: (icon.rotation + 0.5) % 360,
          opacity: 0.3 + Math.sin(Date.now() * 0.002 + icon.id) * 0.3,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!emailRegex.test(email)) {
      toast.error("Email is not in correct format");
      setIsLoading(false);
      return;
    }

    if (password.length == 0) {
      toast.error("Password is not provided");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      loginMutation.mutate(
        { email: email, password: password },
        {
          onSuccess: (response) => {
            console.log("login was sucessful!", response);
          },
          onError: (error) => {
            console.error("Login failed:", error);
          },
        }
      );
    }, 2000);
  };

  const IconComponent = ({ index }: { index: number }) => {
    const icons = [Users, MessageCircle, Heart, Share2];
    const Icon = icons[index % icons.length];
    return <Icon className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Side - Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm" />

        {/* Animated background pattern */}
        <div className="absolute inset-0">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: "3s",
                animationDuration: "2s",
              }}
            />
          ))}
        </div>

        {/* Floating social icons */}
        {animatedIcons.map((icon, index) => (
          <div
            key={icon.id}
            className="absolute text-white/40 transition-all duration-1000 ease-in-out"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              transform: `rotate(${icon.rotation}deg)`,
              opacity: icon.opacity,
            }}
          >
            <IconComponent index={index} />
          </div>
        ))}

        {/* Main content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Social Hub
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded-full" />
            </div>

            <p className="text-xl text-gray-300 max-w-md leading-relaxed">
              Connect, share, and discover amazing content with people around the world
            </p>

            {/* Animated features */}
            <div className="grid grid-cols-2 gap-4 m-8 max-w-sm">
              {[
                { icon: Users, text: "Connect" },
                { icon: MessageCircle, text: "Chat" },
                { icon: Heart, text: "Like" },
                { icon: Share2, text: "Share" },
              ].map((feature, index) => (
                <div
                  key={feature.text}
                  className="flex flex-col items-center space-y-8 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <feature.icon className="w-6 h-6 text-purple-400" />
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="bg-gray-100 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-1 text-center pb-8">
              <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">Sign in to your Social Hub account</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 px-4 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 px-4 pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                    Forgot password?
                  </a>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="pt-6">
              <div className="w-full text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Sign up
                  </a>
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Mobile logo for small screens */}
          <div className="lg:hidden text-center mt-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Social Hub
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialHubLogin;
