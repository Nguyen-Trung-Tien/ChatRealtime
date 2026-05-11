import { Crown, Shield, Users, X } from "lucide-react";

const roleLabel = (role) => {
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "member";
};

const lastSeenLabel = (member) => {
  if (member.isOnline) return "online";
  if (!member.lastSeenAt) return "offline";
  return `last seen ${new Date(member.lastSeenAt).toLocaleString()}`;
};

function RoomPanel({
  roomId,
  roomSubtitle,
  roomMembers,
  currentUserId,
  currentRoomRole,
  showMobilePanel,
  onCloseMobilePanel,
  onLeaveRoom,
  onChangeMemberRole,
}) {
  return (
    <aside className={`room-panel ${showMobilePanel ? "open" : ""}`}>
      <div className="panel-head">
        <h2>Room</h2>
        <button
          type="button"
          className="icon-btn mobile-only"
          onClick={onCloseMobilePanel}
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className="room-chip">#{roomId}</div>
      <p className="room-copy">{roomSubtitle}</p>

      {currentRoomRole !== "owner" ? (
        <button type="button" className="leave-room-btn" onClick={onLeaveRoom}>
          Leave room
        </button>
      ) : null}

      <div className="member-head">
        <Users size={15} />
        <span>Members</span>
      </div>

      <div className="member-list">
        {roomMembers.map((member) => (
          <div key={member.userId} className="member-item detailed">
            <div className="member-main">
              <span className={`member-dot ${member.isOnline ? "" : "offline"}`} />
              <div>
                <div className="member-name">
                  {member.userId === currentUserId ? `${member.username} (you)` : member.username}
                  {member.role === "owner" ? <Crown size={12} /> : null}
                  {member.role === "admin" ? <Shield size={12} /> : null}
                </div>
                <div className="member-meta">
                  {roleLabel(member.role)} | {lastSeenLabel(member)}
                </div>
              </div>
            </div>

            {currentRoomRole === "owner" &&
            member.role !== "owner" &&
            member.userId !== currentUserId ? (
              <div className="member-role-actions">
                {member.role === "member" ? (
                  <button type="button" onClick={() => onChangeMemberRole(member.userId, "admin")}>
                    Make admin
                  </button>
                ) : (
                  <button type="button" onClick={() => onChangeMemberRole(member.userId, "member")}>
                    Make member
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ))}

        {roomMembers.length === 0 ? <div className="member-empty">No members yet.</div> : null}
      </div>
    </aside>
  );
}

export default RoomPanel;
