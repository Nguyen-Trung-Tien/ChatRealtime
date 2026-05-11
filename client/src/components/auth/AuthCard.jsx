import { useState } from "react";
import { Eye, EyeOff, KeyRound, LogIn, UserPlus } from "lucide-react";
import ErrorBanner from "../common/ErrorBanner";
import LoadingSpinner from "../common/LoadingSpinner";

function AuthCard({
  mode,
  username,
  password,
  email,
  phone,
  loading,
  error,
  onModeChange,
  onUsernameChange,
  onPasswordChange,
  onEmailChange,
  onPhoneChange,
  onOpenForgotPassword,
  onSubmit,
}) {
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="join-card" onSubmit={onSubmit}>
      <div className="join-head">
        <div className="logo-badge">
          <KeyRound size={20} />
        </div>
        <div>
          <h1>Chat Realtime</h1>
          <p>{isLogin ? "Dang nhap de tiep tuc" : "Tao tai khoan moi"}</p>
        </div>
      </div>

      <div className="mode-tabs">
        <button
          type="button"
          className={`tab-btn ${isLogin ? "active" : ""}`}
          onClick={() => onModeChange("login")}
        >
          Dang nhap
        </button>
        <button
          type="button"
          className={`tab-btn ${!isLogin ? "active" : ""}`}
          onClick={() => onModeChange("register")}
        >
          Dang ky
        </button>
      </div>

      <label className="field-label" htmlFor="auth-username">
        Username
      </label>
      <input
        id="auth-username"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        className="text-field"
        placeholder="e.g. alex_01"
      />

      <label className="field-label" htmlFor="auth-password">
        Password
      </label>
      <div className="password-field">
        <input
          id="auth-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="text-field"
          placeholder="At least 6 characters"
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {!isLogin ? (
        <>
          <label className="field-label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="text-field"
            placeholder="you@example.com"
          />

          <label className="field-label" htmlFor="auth-phone">
            So dien thoai
          </label>
          <input
            id="auth-phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="text-field"
            placeholder="+84901234567"
          />
        </>
      ) : null}

      {isLogin ? (
        <button type="button" className="text-link-btn" onClick={onOpenForgotPassword}>
          Quen mat khau?
        </button>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? (
          <LoadingSpinner size="sm" label="Dang xu ly..." />
        ) : (
          <>
            {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
            <span>{isLogin ? "Dang nhap" : "Dang ky"}</span>
          </>
        )}
      </button>
    </form>
  );
}

export default AuthCard;
