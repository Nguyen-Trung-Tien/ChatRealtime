import { Clock3, DoorOpen, PlusCircle } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";

function RoomActions({
  createRoomId,
  joinRoomId,
  onCreateRoomIdChange,
  onJoinRoomIdChange,
  onCreateRoom,
  onJoinRoom,
  loading,
}) {
  return (
    <div className="lobby-actions">
      <form className="lobby-card" onSubmit={onCreateRoom}>
        <div className="lobby-card-title">
          <PlusCircle size={16} />
          <span>Tạo phòng mới</span>
        </div>
        <input
          value={createRoomId}
          onChange={(e) => onCreateRoomIdChange(e.target.value)}
          placeholder="room-id (vd: team-alpha)"
        />
        <button type="submit" disabled={loading || !createRoomId.trim()}>
          {loading ? <LoadingSpinner size="sm" label="Đang tạo..." /> : "Tạo và vào phòng"}
        </button>
      </form>

      <form className="lobby-card" onSubmit={onJoinRoom}>
        <div className="lobby-card-title">
          <DoorOpen size={16} />
          <span>Vào phòng có sẵn</span>
        </div>
        <input
          value={joinRoomId}
          onChange={(e) => onJoinRoomIdChange(e.target.value)}
          placeholder="nhập room-id"
        />
        <button type="submit" disabled={loading || !joinRoomId.trim()}>
          {loading ? <LoadingSpinner size="sm" label="Đang vào..." /> : "Tham gia"}
        </button>
      </form>

      <div className="lobby-card hint-card">
        <div className="lobby-card-title">
          <Clock3 size={16} />
          <span>Quy tắc Room ID</span>
        </div>
        <p>Dùng 3-50 ký tự: a-z, 0-9, dấu gạch ngang (-) hoặc gạch dưới (_).</p>
      </div>
    </div>
  );
}

export default RoomActions;
