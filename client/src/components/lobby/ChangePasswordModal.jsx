import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import ErrorBanner from "../common/ErrorBanner";

function ChangePasswordModal({ isOpen, onClose, onSubmit }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setLoading(false);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui long nhap day du thong tin.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mat khau moi phai co it nhat 6 ky tu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mat khau xac nhan khong khop.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ oldPassword, newPassword });
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Doi mat khau that bai.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-title">
            <KeyRound size={16} />
            <h3>Doi mat khau</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={14} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label htmlFor="old-password">Mat khau cu</label>
          <div className="password-field">
            <input
              id="old-password"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              placeholder="Nhap mat khau cu"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowOldPassword((prev) => !prev)}
              aria-label={showOldPassword ? "Hide password" : "Show password"}
              title={showOldPassword ? "Hide password" : "Show password"}
            >
              {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label htmlFor="new-password">Mat khau moi</label>
          <div className="password-field">
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="It nhat 6 ky tu"
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

          <label htmlFor="confirm-password">Xac nhan mat khau moi</label>
          <div className="password-field">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhap lai mat khau moi"
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

          {error ? <ErrorBanner message={error} /> : null}

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose} disabled={loading}>
              Huy
            </button>
            <button type="submit" className="modal-submit" disabled={loading}>
              {loading ? "Dang doi..." : "Xac nhan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
