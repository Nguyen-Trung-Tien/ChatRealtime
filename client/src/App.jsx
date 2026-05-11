import { useCallback, useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import LobbyPage from "./pages/LobbyPage";
import ChatPage from "./pages/ChatPage";
import { useAuth } from "./hooks/useAuth";
import { useChatSocket } from "./hooks/useChatSocket";
import { apiRequest } from "./lib/api";
import ChangePasswordModal from "./components/lobby/ChangePasswordModal";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";

const ACTIVE_ROOM_STORAGE_KEY = "chat_active_room";

function App() {
  const {
    token,
    user,
    authLoading,
    authError,
    login,
    register,
    logout,
    requestPasswordReset,
    resetForgotPassword,
  } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [createRoomId, setCreateRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [activeRoomId, setActiveRoomId] = useState(
    localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY) || ""
  );
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const {
    messages,
    newMessage,
    roomMembers,
    typingUsers,
    replyTarget,
    searchQuery,
    searchResults,
    searchingMessages,
    uploadingFile,
    chatError,
    isConnected,
    roomSubtitle,
    hasMoreMessages,
    loadingMoreMessages,
    setReplyTarget,
    setNewMessage,
    sendMessage,
    uploadFile,
    submitEditMessage,
    deleteMessage,
    loadOlderMessages,
    searchMessages,
    clearSearch,
    loadRoomMembers,
    resetChatState,
  } = useChatSocket({ token, activeRoomId, currentUserId: user?.id });

  const currentRoomRole =
    roomMembers.find((member) => member.userId === user?.id)?.role || "member";

  const setAndPersistActiveRoom = useCallback((roomId) => {
    setActiveRoomId(roomId);
    if (roomId) {
      localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, roomId);
    } else {
      localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
    }
  }, []);

  const loadRoomHistory = useCallback(async () => {
    if (!token) return;

    setRoomsLoading(true);
    setRoomsError("");

    try {
      const data = await apiRequest("/rooms/history", { token });
      setRooms(data.rooms || []);
    } catch (error) {
      setRoomsError(error.message);
    } finally {
      setRoomsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setRooms([]);
      setAndPersistActiveRoom("");
      return;
    }

    loadRoomHistory();
  }, [token, loadRoomHistory, setAndPersistActiveRoom]);

  useEffect(() => {
    if (!token || !activeRoomId) return;
    loadRoomMembers();
  }, [token, activeRoomId, loadRoomMembers]);

  const createRoomAndOpen = async (event) => {
    event.preventDefault();

    const roomId = createRoomId.trim().toLowerCase();
    if (!roomId) return;

    try {
      setRoomsLoading(true);
      setRoomsError("");
      await apiRequest("/rooms", {
        method: "POST",
        token,
        body: { roomId },
      });
      setCreateRoomId("");
      await loadRoomHistory();
      setAndPersistActiveRoom(roomId);
      resetChatState();
    } catch (error) {
      setRoomsError(error.message);
    } finally {
      setRoomsLoading(false);
    }
  };

  const joinExistingRoom = async (event) => {
    event.preventDefault();

    const roomId = joinRoomId.trim().toLowerCase();
    if (!roomId) return;

    try {
      setRoomsLoading(true);
      setRoomsError("");
      await apiRequest(`/rooms/${encodeURIComponent(roomId)}/join`, {
        method: "POST",
        token,
      });
      setJoinRoomId("");
      await loadRoomHistory();
      setAndPersistActiveRoom(roomId);
      resetChatState();
    } catch (error) {
      setRoomsError(error.message);
    } finally {
      setRoomsLoading(false);
    }
  };

  const openRoomFromHistory = (roomId) => {
    setAndPersistActiveRoom(roomId);
    setEditingMessage(null);
    resetChatState();
  };

  const deleteRoom = async (roomId) => {
    try {
      setRoomsLoading(true);
      setRoomsError("");
      await apiRequest(`/rooms/${encodeURIComponent(roomId)}`, {
        method: "DELETE",
        token,
      });

      if (activeRoomId === roomId) {
        setAndPersistActiveRoom("");
        setEditingMessage(null);
        setShowMobilePanel(false);
        resetChatState();
      }

      await loadRoomHistory();
    } catch (error) {
      setRoomsError(error.message);
    } finally {
      setRoomsLoading(false);
    }
  };

  const changePassword = async ({ oldPassword, newPassword }) => {
    await apiRequest("/auth/change-password", {
      method: "POST",
      token,
      body: { oldPassword, newPassword },
    });
  };

  const handleBackToLobby = async () => {
    setAndPersistActiveRoom("");
    setEditingMessage(null);
    setShowMobilePanel(false);
    resetChatState();
    await loadRoomHistory();
  };

  const openEditPopup = (message) => {
    if (!message?.id || message.deletedAt || message.type === "file") return;
    setEditingMessage(message);
  };

  const submitEditFromPopup = (text) => {
    if (!editingMessage?.id) return;
    submitEditMessage({ messageId: editingMessage.id, text });
    setEditingMessage(null);
  };

  const leaveCurrentRoom = async () => {
    if (!activeRoomId) return;
    try {
      await apiRequest(`/rooms/${encodeURIComponent(activeRoomId)}/leave`, {
        method: "POST",
        token,
      });
      await handleBackToLobby();
    } catch (error) {
      setRoomsError(error.message);
    }
  };

  const changeMemberRole = async (targetUserId, role) => {
    if (!activeRoomId) return;
    try {
      await apiRequest(`/rooms/${encodeURIComponent(activeRoomId)}/members/${targetUserId}/role`, {
        method: "PATCH",
        token,
        body: { role },
      });
      await loadRoomMembers();
    } catch (error) {
      setRoomsError(error.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAndPersistActiveRoom("");
    setShowMobilePanel(false);
    setShowChangePasswordModal(false);
    setEditingMessage(null);
    setRooms([]);
    setRoomsError("");
    resetChatState();
  };

  if (authLoading) {
    return (
      <div className="landing-shell">
        <div className="join-card loading-card">
          <LoadingSpinner label="Loading session..." />
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        onRequestPasswordReset={requestPasswordReset}
        onResetForgotPassword={resetForgotPassword}
        authError={authError}
      />
    );
  }

  if (!activeRoomId) {
    return (
      <>
        <LobbyPage
          user={user}
          rooms={rooms}
          loading={roomsLoading}
          error={roomsError}
          createRoomId={createRoomId}
          joinRoomId={joinRoomId}
          onCreateRoomIdChange={setCreateRoomId}
          onJoinRoomIdChange={setJoinRoomId}
          onCreateRoom={createRoomAndOpen}
          onJoinRoom={joinExistingRoom}
          onOpenRoom={openRoomFromHistory}
          onDeleteRoom={deleteRoom}
          onReload={loadRoomHistory}
          onChangePassword={() => setShowChangePasswordModal(true)}
          onLogout={handleLogout}
        />

        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSubmit={changePassword}
        />
      </>
    );
  }

  return (
    <ChatPage
      roomId={activeRoomId}
      roomSubtitle={roomSubtitle}
      isConnected={isConnected}
      chatError={chatError}
      roomMembers={roomMembers}
      currentUserId={user?.id}
      currentRoomRole={currentRoomRole}
      messages={messages}
      hasMoreMessages={hasMoreMessages}
      loadingMoreMessages={loadingMoreMessages}
      typingUsers={typingUsers}
      replyTarget={replyTarget}
      searchQuery={searchQuery}
      searchResults={searchResults}
      searchingMessages={searchingMessages}
      uploadingFile={uploadingFile}
      newMessage={newMessage}
      showMobilePanel={showMobilePanel}
      onLoadOlderMessages={loadOlderMessages}
      onReplyMessage={setReplyTarget}
      onEditMessage={openEditPopup}
      editingMessage={editingMessage}
      onCloseEditModal={() => setEditingMessage(null)}
      onSubmitEditModal={submitEditFromPopup}
      onDeleteMessage={deleteMessage}
      onSearchMessages={searchMessages}
      onClearSearch={clearSearch}
      onCancelReply={() => setReplyTarget(null)}
      onUploadFile={uploadFile}
      onLeaveRoom={leaveCurrentRoom}
      onChangeMemberRole={changeMemberRole}
      onMessageChange={setNewMessage}
      onSendMessage={sendMessage}
      onOpenMobilePanel={() => setShowMobilePanel(true)}
      onCloseMobilePanel={() => setShowMobilePanel(false)}
      onBackToLobby={handleBackToLobby}
      onLogout={handleLogout}
    />
  );
}

export default App;
