// src/components/ui/loading-button.tsx
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  isLoading: boolean;
  loadingText?: string;
}

const LoadingButton = ({
  isLoading,
  children,
  loadingText = "Loading...", // Default loading text
  className,
  ...props // Pass down all other button props like onClick, type, etc.
}: LoadingButtonProps) => {
  return (
    <Button
      disabled={isLoading || props.disabled}
      className={cn(
        "w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]",
        className // Allows for additional custom classes
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
