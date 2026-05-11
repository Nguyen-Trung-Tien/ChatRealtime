import { useEffect, useState } from "react";
import AuthCard from "../components/auth/AuthCard";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

function AuthPage({
  onLogin,
  onRegister,
  onRequestPasswordReset,
  onResetForgotPassword,
  authError,
}) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [successPopup, setSuccessPopup] = useState("");

  useEffect(() => {
    if (!successPopup) return undefined;

    const timeoutId = setTimeout(() => {
      setSuccessPopup("");
    }, 3500);

    return () => clearTimeout(timeoutId);
  }, [successPopup]);

  const handleForgotPasswordResetSuccess = (nextUsername) => {
    setMode("login");
    setUsername(nextUsername || "");
    setPassword("");
    setShowForgotPasswordModal(false);
    setLocalError("");
    setSuccessPopup("Thay doi mat khau thanh cong. Vui long dang nhap lai.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    try {
      setLoading(true);
      const payload = {
        username: username.trim().toLowerCase(),
        password,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };

      if (!payload.username || !payload.password) {
        setLocalError("Username va password la bat buoc.");
        return;
      }

      if (mode === "login") {
        await onLogin(payload);
      } else {
        if (!payload.email || !payload.phone) {
          setLocalError("Email va so dien thoai la bat buoc khi dang ky.");
          return;
        }
        await onRegister(payload);
      }
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="landing-shell">
        <div className="landing-orb orb-one" />
        <div className="landing-orb orb-two" />
        {successPopup ? (
          <div className="auth-toast" role="status" aria-live="polite">
            <span>{successPopup}</span>
            <button
              type="button"
              className="auth-toast-close"
              onClick={() => setSuccessPopup("")}
              aria-label="Close notification"
            >
              x
            </button>
          </div>
        ) : null}

        <AuthCard
          mode={mode}
          username={username}
          password={password}
          email={email}
          phone={phone}
          loading={loading}
          error={localError || authError}
          onModeChange={setMode}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
          onOpenForgotPassword={() => setShowForgotPasswordModal(true)}
          onSubmit={handleSubmit}
        />
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onRequestPasswordReset={onRequestPasswordReset}
        onResetForgotPassword={onResetForgotPassword}
        onResetSuccess={handleForgotPasswordResetSuccess}
      />
    </>
  );
}

export default AuthPage;
