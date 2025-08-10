import { Card, CardContent, CardTitle } from "@/components/ui/card";
import GradientText from "@/components/ui/gradient-text";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/ui/loading-button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router";

// Helper components remain the same
interface FormInputProps extends React.ComponentProps<typeof Input> {
  className?: string;
}

const FormInput = ({ className, ...props }: FormInputProps) => {
  return <Input className={cn("border-gray-400 focus:border-accent-foreground", className)} {...props} />;
};

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-red-500 text-xs text-left px-1">{message}</p>;
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { fullName, email, userName, password, confirmPassword } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName) {
      newErrors.fullName = "Full name is required.";
    } else if (!/^[\p{L}\s]+$/u.test(fullName)) {
      newErrors.fullName = "Full name should not contain special characters.";
    }
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!userName) newErrors.userName = "Username is required.";
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (validate()) {
      console.log("Form is valid, submitting data:", { fullName, email, userName });
      // Perform submission logic here
    } else {
      console.log("Form is invalid");
    }
    setIsLoading(false);
  };

  const isButtonDisabled = Object.values(formData).some((value) => value === "");

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Card className="w-full max-w-sm flex-col text-center bg-white text-black border-accent-foreground shadow-2xl drop-shadow-accent">
        <CardTitle className="font-bold flex flex-col gap-y-2">
          <GradientText className="text-4xl p-2">Social Hub</GradientText>
          <span className="font-bold text-sm">Sign up to see photos and videos from your friends.</span>
        </CardTitle>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
            <div>
              <FormInput
                name="fullName"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={handleChange}
                className={cn({ "border-red-500": errors.fullName })}
              />
              <ErrorMessage message={errors.fullName} />
            </div>
            <div>
              <FormInput
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleChange}
                className={cn({ "border-red-500": errors.email })}
              />
              <ErrorMessage message={errors.email} />
            </div>
            <div>
              <FormInput
                name="userName"
                type="text"
                placeholder="Username"
                value={userName}
                onChange={handleChange}
                className={cn({ "border-red-500": errors.userName })}
              />
              <ErrorMessage message={errors.userName} />
            </div>
            <div>
              <FormInput
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handleChange}
                className={cn({ "border-red-500": errors.password })}
              />
              <ErrorMessage message={errors.password} />
            </div>
            <div>
              <FormInput
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleChange}
                className={cn({ "border-red-500": errors.confirmPassword })}
              />
              <ErrorMessage message={errors.confirmPassword} />
            </div>
            <LoadingButton type="submit" isLoading={isLoading} disabled={isButtonDisabled} loadingText="Signing up...">
              Sign Up
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full max-w-sm flex-col text-center bg-white text-shadow-white border-accent-foreground shadow-2xl drop-shadow-accent mt-3">
        <h2>
          Have an account?{" "}
          <span>
            <Link to={"/"} className="text-purple-600 hover:text-purple-700 font-semibold">
              Sign in
            </Link>
          </span>
        </h2>
      </Card>
    </div>
  );
};

export default SignUp;
