import { Paperclip, Send } from "lucide-react";

function MessageComposer({
  value,
  isConnected,
  typingUsers,
  replyTarget,
  uploadingFile,
  onCancelReply,
  onUploadFile,
  onChange,
  onSubmit,
}) {
  const handleUploadChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUploadFile(file);
    event.target.value = "";
  };

  return (
    <footer className="composer">
      {replyTarget ? (
        <div className="reply-box">
          <div>
            Replying to <strong>{replyTarget.senderName}</strong>
          </div>
          <button type="button" className="text-link-btn" onClick={onCancelReply}>
            Cancel
          </button>
        </div>
      ) : null}

      {typingUsers.length > 0 ? (
        <div className="typing-row">{typingUsers.map((u) => u.username).join(", ")} typing...</div>
      ) : null}

      <form onSubmit={onSubmit}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write a message..."
        />

        <label className="upload-btn" title="Upload file">
          <input type="file" onChange={handleUploadChange} disabled={uploadingFile || !isConnected} />
          <Paperclip size={15} />
        </label>

        <button type="submit" disabled={!value.trim() || !isConnected}>
          <Send size={15} />
        </button>
      </form>

      {uploadingFile ? <div className="typing-row">Uploading file...</div> : null}
    </footer>
  );
}

export default MessageComposer;
