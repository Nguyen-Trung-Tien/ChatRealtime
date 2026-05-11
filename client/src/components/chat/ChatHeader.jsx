import { ArrowLeft, LogOut, Menu } from "lucide-react";

function ChatHeader({ isConnected, onOpenMobilePanel, onBackToLobby, onLogout }) {
  return (
    <header className="chat-head">
      <div>
        <h2>Live Conversation</h2>
        <p>{isConnected ? "Connected" : "Disconnected"}</p>
      </div>

      <div className="chat-head-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onBackToLobby}
          aria-label="Back to lobby"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onLogout}
          aria-label="Logout"
        >
          <LogOut size={15} />
        </button>
        <button
          type="button"
          className="icon-btn mobile-only"
          onClick={onOpenMobilePanel}
          aria-label="Open room panel"
        >
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
