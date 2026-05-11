import JoinForm from "../components/join/JoinForm";

function JoinPage({
  username,
  roomId,
  roomSubtitle,
  chatError,
  onUsernameChange,
  onRoomIdChange,
  onJoin,
}) {
  return (
    <div className="landing-shell">
      <div className="landing-orb orb-one" />
      <div className="landing-orb orb-two" />

      <JoinForm
        username={username}
        roomId={roomId}
        roomSubtitle={roomSubtitle}
        chatError={chatError}
        onUsernameChange={onUsernameChange}
        onRoomIdChange={onRoomIdChange}
        onSubmit={onJoin}
      />
    </div>
  );
}

export default JoinPage;
