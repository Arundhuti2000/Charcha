import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: string;
  className: string;
}

const GradientText = ({ children, className }: GradientTextProps) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-purple-900 via-purple-600 to-teal-400 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
};

export default GradientText;
