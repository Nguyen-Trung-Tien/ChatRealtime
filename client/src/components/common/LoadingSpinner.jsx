function LoadingSpinner({ size = "md", label = "Loading..." }) {
  const className = size === "sm" ? "loading-spinner sm" : "loading-spinner";
  return (
    <div className="loading-inline" role="status" aria-live="polite" aria-label={label}>
      <span className={className} />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
