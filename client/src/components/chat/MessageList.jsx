import { useEffect, useState, useRef } from "react";
import LoadingSpinner from "../common/LoadingSpinner";

const safeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const renderMessageBody = (message) => {
  if (message.deletedAt) {
    return <div className="bubble">This message was deleted.</div>;
  }

  if (message.type === "file" && message.file) {
    return (
      <div className="bubble">
        <a href={message.file.url} target="_blank" rel="noreferrer">
          {message.file.fileName}
        </a>
      </div>
    );
  }

  return <div className="bubble">{message.text}</div>;
};

function MessageList({
  messages,
  hasMoreMessages,
  loadingMoreMessages,
  searchQuery,
  searchResults,
  searchingMessages,
  onLoadOlderMessages,
  onSearchMessages,
  onClearSearch,
  onReplyMessage,
  onEditMessage,
  onDeleteMessage,
}) {
  const [queryInput, setQueryInput] = useState("");
  const messagesEndRef = useRef(null);

  const showingSearch = Boolean(searchQuery);
  const renderedMessages = showingSearch ? searchResults : messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [renderedMessages]);

  const handleSearch = (event) => {
    event.preventDefault();
    onSearchMessages(queryInput);
  };

  return (
    <main className="messages-wrap">
      <form className="search-row" onSubmit={handleSearch}>
        <input
          value={queryInput}
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder="Search messages..."
        />
        <button type="submit" className="load-older-btn" disabled={searchingMessages}>
          {searchingMessages ? "Searching..." : "Search"}
        </button>
        {showingSearch ? (
          <button
            type="button"
            className="load-older-btn"
            onClick={() => {
              setQueryInput("");
              onClearSearch();
            }}
          >
            Clear
          </button>
        ) : null}
      </form>

      {!showingSearch && hasMoreMessages ? (
        <div className="load-older-row">
          <button
            type="button"
            className="load-older-btn"
            onClick={onLoadOlderMessages}
            disabled={loadingMoreMessages}
          >
            {loadingMoreMessages ? (
              <LoadingSpinner size="sm" label="Loading..." />
            ) : (
              "Load older messages"
            )}
          </button>
        </div>
      ) : null}

      {showingSearch ? <div className="typing-row">Search result for: "{searchQuery}"</div> : null}

      {renderedMessages.map((message) => {
        if (message.type === "system") {
          return (
            <div className="system-row" key={message.id}>
              <span>{message.text}</span>
            </div>
          );
        }

        return (
          <article key={message.id} className={`message-row ${message.isMine ? "mine" : ""}`}>
            <p className="sender-name">{message.isMine ? "You" : message.senderName}</p>

            {message.replyTo ? (
              <div className="reply-preview">
                <strong>{message.replyTo.senderName}</strong>:{" "}
                {message.replyTo.deletedAt ? "(deleted message)" : message.replyTo.text}
              </div>
            ) : null}

            {renderMessageBody(message)}

            <time className="stamp">
              {safeTime(message.timestamp)}
              {message.editedAt && !message.deletedAt ? " (edited)" : ""}
            </time>

            <div className="msg-actions">
              <button type="button" className="text-link-btn" onClick={() => onReplyMessage(message)}>
                Reply
              </button>
              {message.isMine && !message.deletedAt && message.type !== "file" ? (
                <button type="button" className="text-link-btn" onClick={() => onEditMessage(message)}>
                  Edit
                </button>
              ) : null}
              {!message.deletedAt ? (
                <button type="button" className="text-link-btn danger-link" onClick={() => onDeleteMessage(message)}>
                  Delete
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
      <div ref={messagesEndRef} />
    </main>
  );
}

export default MessageList;
