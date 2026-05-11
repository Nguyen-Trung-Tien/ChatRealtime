import { LogIn, MessageCircle } from "lucide-react";
import ErrorBanner from "../common/ErrorBanner";

function JoinForm({
  username,
  roomId,
  roomSubtitle,
  chatError,
  onUsernameChange,
  onRoomIdChange,
  onSubmit,
}) {
  return (
    <form className="join-card" onSubmit={onSubmit}>
      <div className="join-head">
        <div className="logo-badge">
          <MessageCircle size={20} />
        </div>
        <div>
          <h1>Chat Realtime</h1>
          <p>{roomSubtitle}</p>
        </div>
      </div>

      <label className="field-label" htmlFor="username">
        Username
      </label>
      <input
        id="username"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        className="text-field"
        placeholder="e.g. alex"
      />

      <label className="field-label" htmlFor="roomId">
        Room ID
      </label>
      <input
        id="roomId"
        value={roomId}
        onChange={(e) => onRoomIdChange(e.target.value)}
        className="text-field"
        placeholder="e.g. global-room"
      />

      {chatError ? <ErrorBanner message={chatError} /> : null}

      <button className="primary-btn" type="submit">
        <LogIn size={16} />
        <span>Join Chat</span>
      </button>
    </form>
  );
}

export default JoinForm;
