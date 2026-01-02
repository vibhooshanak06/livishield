import { Loader2 } from "lucide-react";
import "../styles/loading.css";

const LoadingSpinner = ({ size = "default", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {message && <p className="text-muted-foreground">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;