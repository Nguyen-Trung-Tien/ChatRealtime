import { AlertCircle } from "lucide-react";

function ErrorBanner({ message, className = "" }) {
  return (
    <div className={`error-banner ${className}`.trim()}>
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}

export default ErrorBanner;
