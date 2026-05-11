import RoomPanel from "../components/chat/RoomPanel";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageComposer from "../components/chat/MessageComposer";
import EditMessageModal from "../components/chat/EditMessageModal";
import ErrorBanner from "../components/common/ErrorBanner";

function ChatPage({
  roomId,
  roomSubtitle,
  isConnected,
  chatError,
  roomMembers,
  currentUserId,
  currentRoomRole,
  messages,
  hasMoreMessages,
  loadingMoreMessages,
  typingUsers,
  replyTarget,
  searchQuery,
  searchResults,
  searchingMessages,
  uploadingFile,
  newMessage,
  showMobilePanel,
  onLoadOlderMessages,
  onReplyMessage,
  onEditMessage,
  editingMessage,
  onCloseEditModal,
  onSubmitEditModal,
  onDeleteMessage,
  onSearchMessages,
  onClearSearch,
  onCancelReply,
  onUploadFile,
  onLeaveRoom,
  onChangeMemberRole,
  onMessageChange,
  onSendMessage,
  onOpenMobilePanel,
  onCloseMobilePanel,
  onBackToLobby,
  onLogout,
}) {
  return (
    <div className="chat-shell">
      <div className="chat-grid">
        <RoomPanel
          roomId={roomId}
          roomSubtitle={roomSubtitle}
          roomMembers={roomMembers}
          currentUserId={currentUserId}
          currentRoomRole={currentRoomRole}
          showMobilePanel={showMobilePanel}
          onCloseMobilePanel={onCloseMobilePanel}
          onLeaveRoom={onLeaveRoom}
          onChangeMemberRole={onChangeMemberRole}
        />

        <section className="chat-main">
          <div>
            <ChatHeader
              isConnected={isConnected}
              onOpenMobilePanel={onOpenMobilePanel}
              onBackToLobby={onBackToLobby}
              onLogout={onLogout}
            />

            {chatError ? <ErrorBanner className="inline" message={chatError} /> : null}
          </div>

          <MessageList
            messages={messages}
            hasMoreMessages={hasMoreMessages}
            loadingMoreMessages={loadingMoreMessages}
            searchQuery={searchQuery}
            searchResults={searchResults}
            searchingMessages={searchingMessages}
            onLoadOlderMessages={onLoadOlderMessages}
            onSearchMessages={onSearchMessages}
            onClearSearch={onClearSearch}
            onReplyMessage={onReplyMessage}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
          />

          <MessageComposer
            value={newMessage}
            isConnected={isConnected}
            typingUsers={typingUsers}
            replyTarget={replyTarget}
            uploadingFile={uploadingFile}
            onCancelReply={onCancelReply}
            onUploadFile={onUploadFile}
            onChange={onMessageChange}
            onSubmit={onSendMessage}
          />
        </section>
      </div>

      <EditMessageModal
        message={editingMessage}
        onClose={onCloseEditModal}
        onSubmit={onSubmitEditModal}
      />
    </div>
  );
}

export default ChatPage;
