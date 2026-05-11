import { KeyRound, LogOut, RefreshCcw, User } from "lucide-react";
import ErrorBanner from "../components/common/ErrorBanner";
import RoomActions from "../components/lobby/RoomActions";
import RoomHistoryList from "../components/lobby/RoomHistoryList";

function LobbyPage({
  user,
  rooms,
  loading,
  error,
  createRoomId,
  joinRoomId,
  onCreateRoomIdChange,
  onJoinRoomIdChange,
  onCreateRoom,
  onJoinRoom,
  onOpenRoom,
  onDeleteRoom,
  onReload,
  onChangePassword,
  onLogout,
}) {
  return (
    <div className="lobby-shell">
      <header className="lobby-header">
        <div className="identity-chip">
          <User size={15} />
          <span>{user?.username}</span>
        </div>

        <div className="lobby-head-actions">
          <button type="button" className="icon-btn" onClick={onReload} aria-label="Reload rooms">
            <RefreshCcw size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onChangePassword}
            aria-label="Change password"
          >
            <KeyRound size={15} />
          </button>
          <button type="button" className="icon-btn" onClick={onLogout} aria-label="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {error ? <ErrorBanner message={error} /> : null}

      <RoomActions
        createRoomId={createRoomId}
        joinRoomId={joinRoomId}
        onCreateRoomIdChange={onCreateRoomIdChange}
        onJoinRoomIdChange={onJoinRoomIdChange}
        onCreateRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
        loading={loading}
      />

      <RoomHistoryList
        rooms={rooms}
        loading={loading}
        onOpenRoom={onOpenRoom}
        onDeleteRoom={onDeleteRoom}
      />
    </div>
  );
}

export default LobbyPage;
