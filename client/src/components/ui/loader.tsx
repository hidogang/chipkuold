import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

export function Loader({ className, size = "default", ...props }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div {...props} className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-border", sizeClasses[size])} />
    </div>
  );
}
