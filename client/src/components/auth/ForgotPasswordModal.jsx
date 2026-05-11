import { useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import ErrorBanner from "../common/ErrorBanner";

function ForgotPasswordModal({
  isOpen,
  onClose,
  onRequestPasswordReset,
  onResetForgotPassword,
  onResetSuccess,
}) {
  const [username, setUsername] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setUsername("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setMessage("");
    setError("");
    setLoading(false);
    onClose();
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      setError("Please enter your username.");
      return;
    }

    try {
      setLoading(true);
      const data = await onRequestPasswordReset({ username: normalizedUsername });
      if (import.meta.env.DEV && data?.resetToken) {
        setResetToken(data.resetToken);
      }
      setMessage(
        import.meta.env.DEV && data?.resetToken
          ? "Reset token has been auto-filled for development."
          : data?.message ||
            "If the account exists, a reset token was sent through your verification channel."
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to create reset request.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || !resetToken.trim() || !newPassword) {
      setError("Please fill all reset fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setLoading(true);
      await onResetForgotPassword({
        username: normalizedUsername,
        token: resetToken.trim(),
        newPassword,
      });
      onResetSuccess?.(normalizedUsername);
      setMessage("Password reset successful. Please login again.");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (resetError) {
      setError(resetError.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <div className="modal-title">
            <KeyRound size={16} />
            <h3>Forgot Password</h3>
          </div>
          <button type="button" className="icon-btn" onClick={handleClose} aria-label="Close modal">
            <X size={14} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleRequest}>
          <label htmlFor="forgot-username">Username</label>
          <input
            id="forgot-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
          />
          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? "Creating..." : "Request reset token"}
          </button>
        </form>

        <form className="modal-form" onSubmit={handleReset}>
          <label htmlFor="forgot-token">Reset token</label>
          <input
            id="forgot-token"
            value={resetToken}
            onChange={(event) => setResetToken(event.target.value)}
            placeholder="Paste reset token"
          />

          <label htmlFor="forgot-password-new">New password</label>
          <div className="password-field">
            <input
              id="forgot-password-new"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              title={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label htmlFor="forgot-password-confirm">Confirm new password</label>
          <div className="password-field">
            <input
              id="forgot-password-confirm"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter password again"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {message ? <div className="success-note">{message}</div> : null}
          {error ? <ErrorBanner message={error} /> : null}

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={handleClose} disabled={loading}>
              Close
            </button>
            <button type="submit" className="modal-submit" disabled={loading}>
              {loading ? "Processing..." : "Reset password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
