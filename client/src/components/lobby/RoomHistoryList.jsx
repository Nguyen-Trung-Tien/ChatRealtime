function RoomHistoryList({ rooms, loading, onOpenRoom, onDeleteRoom }) {
  return (
    <div className="history-panel">
      <h3>Lịch sử phòng</h3>
      <div className="history-list">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="history-skeleton" />
            ))
          : null}

        {!loading
          ? rooms.map((room) => (
              <div key={room.room_id} className="history-item-wrap">
                <button
                  type="button"
                  className="history-item"
                  onClick={() => onOpenRoom(room.room_id)}
                >
                  <div className="history-head">
                    <div className="history-title">
                      <strong>#{room.room_id}</strong>
                      {room.is_owner ? <span className="owner-tag">owner</span> : null}
                      <span className="member-count">{room.member_count} members</span>
                    </div>
                    <span>
                      {room.last_message_at
                        ? new Date(room.last_message_at).toLocaleString()
                        : "No messages"}
                    </span>
                  </div>
                  <p>{room.last_message || "Chưa có tin nhắn"}</p>
                </button>

                {room.is_owner ? (
                  <button
                    type="button"
                    className="delete-room-btn"
                    onClick={() => onDeleteRoom(room.room_id)}
                  >
                    Xóa
                  </button>
                ) : null}
              </div>
            ))
          : null}

        {!loading && rooms.length === 0 ? (
          <div className="history-empty">Chưa có phòng nào trong lịch sử.</div>
        ) : null}
      </div>
    </div>
  );
}

export default RoomHistoryList;
