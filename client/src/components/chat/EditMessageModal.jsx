import { useEffect, useState } from "react";
import { X } from "lucide-react";

function EditMessageModal({ message, onClose, onSubmit }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(message?.text || "");
  }, [message]);

  if (!message) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <h3>Edit message</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={14} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <textarea
            className="modal-textarea"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Edit message..."
            rows={4}
          />

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-submit" disabled={!value.trim()}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMessageModal;
