import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { apiRequest, getApiUrl } from "../lib/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

const parseFilePayload = (text) => {
  try {
    const raw = JSON.parse(text || "{}");
    if (!raw?.url) return null;
    return {
      fileName: raw.fileName || "file",
      mimeType: raw.mimeType || "application/octet-stream",
      size: raw.size || 0,
      url: raw.url.startsWith("http") ? raw.url : `${getApiUrl().replace("/api/v1", "")}${raw.url}`,
    };
  } catch {
    return null;
  }
};

const toUiMessage = (raw, currentUserId) => {
  if (!raw) return null;

  const id =
    raw.id ||
    `${raw.timestamp || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    text: raw.text ?? "",
    senderName: raw.senderName || "Unknown",
    senderId: raw.senderId || "",
    timestamp: raw.timestamp || Date.now(),
    isMine: Boolean(raw.senderId) && Boolean(currentUserId) && raw.senderId === currentUserId,
    type: raw.type || "user",
    file: raw.type === "file" ? parseFilePayload(raw.text) : null,
    editedAt: raw.editedAt || null,
    deletedAt: raw.deletedAt || null,
    replyTo: raw.replyTo || null,
  };
};

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Cannot read file"));
        return;
      }
      const [, base64Data = ""] = result.split(",");
      resolve(base64Data);
    };
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.readAsDataURL(file);
  });

export function useChatSocket({ token, activeRoomId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTarget, setReplyTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingMessages, setSearchingMessages] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [chatError, setChatError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [mySocketId, setMySocketId] = useState("");
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

  const socketRef = useRef(null);
  const activeRoomRef = useRef(activeRoomId);
  const typingTimeoutRef = useRef(null);
  const typingUserTimersRef = useRef(new Map());

  useEffect(() => {
    activeRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setMySocketId(socket.id);
      setIsConnected(true);
      setChatError("");

      if (activeRoomRef.current) {
        socket.emit("join_room", { roomId: activeRoomRef.current });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setMySocketId("");
      setOnlineUsers([]);
      setTypingUsers([]);
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setChatError(error?.message || "Cannot connect to chat server.");
    });

    socket.on("chat_error", (payload) => {
      setChatError(payload?.message || "Chat server error.");
    });

    socket.on("room_deleted", (payload) => {
      setChatError(`Room ${payload?.roomId || ""} has been deleted.`);
      setMessages([]);
      setOnlineUsers([]);
      setRoomMembers([]);
      setTypingUsers([]);
      setReplyTarget(null);
      setHasMoreMessages(false);
      setSearchQuery("");
      setSearchResults([]);
    });

    socket.on("room_joined", (payload) => {
      if (Array.isArray(payload?.messages)) {
        setMessages(payload.messages.map((m) => toUiMessage(m, currentUserId)).filter(Boolean));
      } else {
        setMessages([]);
      }

      if (Array.isArray(payload?.onlineUsers)) {
        setOnlineUsers(payload.onlineUsers);
      } else {
        setOnlineUsers([]);
      }

      if (Array.isArray(payload?.members)) {
        setRoomMembers(payload.members);
      } else {
        setRoomMembers([]);
      }

      setTypingUsers([]);
      setReplyTarget(null);
      setSearchQuery("");
      setSearchResults([]);
      setHasMoreMessages(Boolean(payload?.hasMore));
      setChatError("");
    });

    socket.on("room_members_updated", (payload) => {
      if (Array.isArray(payload?.members)) {
        setRoomMembers(payload.members);
      }
    });

    socket.on("member_presence", (payload) => {
      const userId = payload?.userId;
      if (!userId) return;

      setRoomMembers((prev) =>
        prev.map((member) =>
          member.userId === userId
            ? {
                ...member,
                isOnline: Boolean(payload?.isOnline),
                lastSeenAt: payload?.lastSeenAt || member.lastSeenAt,
              }
            : member
        )
      );
    });

    socket.on("user_joined", (payload) => {
      const user = payload?.user;
      if (!user) return;

      setOnlineUsers((prev) => {
        if (prev.some((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });

      setRoomMembers((prev) =>
        prev.map((member) =>
          member.userId === user.userId ? { ...member, isOnline: true, socketId: user.id } : member
        )
      );
    });

    socket.on("user_left", (payload) => {
      const user = payload?.user;
      if (!user) return;

      setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
      setRoomMembers((prev) =>
        prev.map((member) =>
          member.userId === user.userId
            ? { ...member, isOnline: false, lastSeenAt: Date.now(), socketId: null }
            : member
        )
      );
    });

    socket.on("typing", (payload) => {
      const userId = payload?.userId;
      if (!userId || userId === currentUserId) return;

      const timerMap = typingUserTimersRef.current;
      if (payload?.isTyping) {
        setTypingUsers((prev) => {
          if (prev.some((user) => user.userId === userId)) return prev;
          return [...prev, { userId, username: payload?.username || "Unknown" }];
        });

        const previousTimeout = timerMap.get(userId);
        if (previousTimeout) {
          clearTimeout(previousTimeout);
        }
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
          timerMap.delete(userId);
        }, 2500);
        timerMap.set(userId, timeout);
      } else {
        const previousTimeout = timerMap.get(userId);
        if (previousTimeout) {
          clearTimeout(previousTimeout);
          timerMap.delete(userId);
        }
        setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
      }
    });

    socket.on("receive_message", (payload) => {
      const raw = payload?.message || payload;
      const uiMsg = toUiMessage(raw, currentUserId);
      if (!uiMsg) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === uiMsg.id)) return prev;
        return [...prev, uiMsg];
      });
    });

    socket.on("message_updated", (payload) => {
      const raw = payload?.message || payload;
      const uiMsg = toUiMessage(raw, currentUserId);
      if (!uiMsg) return;

      setMessages((prev) => prev.map((m) => (m.id === uiMsg.id ? uiMsg : m)));
      setReplyTarget((prev) => (prev?.id === uiMsg.id ? uiMsg : prev));
    });

    socket.on("message_deleted", (payload) => {
      const messageId = payload?.messageId;
      if (!messageId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, text: "", deletedAt: Date.now(), editedAt: m.editedAt } : m
        )
      );
      setReplyTarget((prev) => (prev?.id === messageId ? null : prev));
    });

    return () => {
      typingUserTimersRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      typingUserTimersRef.current.clear();
      socket.disconnect();
    };
  }, [token, currentUserId]);

  useEffect(() => {
    if (!isConnected || !activeRoomId || !socketRef.current) {
      return;
    }

    socketRef.current.emit("join_room", { roomId: activeRoomId });
  }, [activeRoomId, isConnected]);

  const roomSubtitle = useMemo(() => {
    if (!activeRoomId) return "Select a room to start chatting.";
    if (!isConnected) return "Reconnecting...";
    const onlineCount = roomMembers.filter((member) => member.isOnline).length || onlineUsers.length;
    return `${onlineCount} online in this room`;
  }, [activeRoomId, isConnected, onlineUsers.length, roomMembers]);

  const emitTyping = (isTyping) => {
    if (!socketRef.current || !activeRoomId) return;
    socketRef.current.emit("typing", { roomId: activeRoomId, isTyping });
  };

  const handleMessageChange = (value) => {
    setNewMessage(value);
    emitTyping(Boolean(value.trim()));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1200);
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const trimmed = newMessage.trim();
    if (!trimmed || !socketRef.current || !activeRoomId) return;

    socketRef.current.emit("send_message", {
      text: trimmed,
      roomId: activeRoomId,
      replyToId: replyTarget?.id || null,
    });

    setNewMessage("");
    setReplyTarget(null);
    emitTyping(false);
  };

  const uploadFile = async (file) => {
    if (!token || !activeRoomId || !file) return;
    try {
      setUploadingFile(true);
      const base64Data = await readFileAsBase64(file);
      await apiRequest(`/rooms/${encodeURIComponent(activeRoomId)}/uploads`, {
        method: "POST",
        token,
        body: {
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          base64Data,
        },
      });
    } catch (error) {
      setChatError(error.message || "Cannot upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const submitEditMessage = ({ messageId, text }) => {
    if (!messageId || !socketRef.current || !activeRoomId) return;
    const nextText = (text || "").trim();
    if (!nextText) return;
    socketRef.current.emit("edit_message", {
      messageId,
      roomId: activeRoomId,
      text: nextText,
    });
  };

  const deleteMessage = (message) => {
    if (!message?.id || !socketRef.current || !activeRoomId || message.deletedAt) return;
    if (!window.confirm("Delete this message?")) return;

    socketRef.current.emit("delete_message", {
      messageId: message.id,
      roomId: activeRoomId,
    });
  };

  const loadOlderMessages = async () => {
    if (!token || !activeRoomId || !hasMoreMessages || loadingMoreMessages || messages.length === 0) {
      return;
    }

    try {
      setLoadingMoreMessages(true);
      const oldestMessageId = messages[0].id;

      const data = await apiRequest(
        `/rooms/${encodeURIComponent(activeRoomId)}/messages?beforeId=${oldestMessageId}&limit=30`,
        { token }
      );

      const older = (data.messages || [])
        .map((m) => toUiMessage(m, currentUserId))
        .filter(Boolean);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const dedupOlder = older.filter((m) => !existingIds.has(m.id));
        return [...dedupOlder, ...prev];
      });

      setHasMoreMessages(Boolean(data.hasMore));
    } catch (error) {
      setChatError(error.message);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  const searchMessages = async (query) => {
    if (!token || !activeRoomId) return;
    const normalized = (query || "").trim();
    if (!normalized) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    try {
      setSearchingMessages(true);
      const data = await apiRequest(
        `/rooms/${encodeURIComponent(activeRoomId)}/messages/search?q=${encodeURIComponent(
          normalized
        )}&limit=50`,
        { token }
      );
      const result = (data.messages || [])
        .map((m) => toUiMessage(m, currentUserId))
        .filter(Boolean);
      setSearchQuery(normalized);
      setSearchResults(result);
    } catch (error) {
      setChatError(error.message || "Cannot search messages");
    } finally {
      setSearchingMessages(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const loadRoomMembers = useCallback(async () => {
    if (!token || !activeRoomId) return;
    try {
      const data = await apiRequest(`/rooms/${encodeURIComponent(activeRoomId)}/members`, {
        token,
      });
      setRoomMembers(Array.isArray(data?.members) ? data.members : []);
    } catch {
      // ignore because socket room_joined usually contains members.
    }
  }, [token, activeRoomId]);

  const resetChatState = () => {
    setMessages([]);
    setOnlineUsers([]);
    setRoomMembers([]);
    setTypingUsers([]);
    setReplyTarget(null);
    setNewMessage("");
    setChatError("");
    setHasMoreMessages(false);
    setLoadingMoreMessages(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchingMessages(false);
    setUploadingFile(false);
  };

  return {
    messages,
    newMessage,
    onlineUsers,
    roomMembers,
    typingUsers,
    replyTarget,
    searchQuery,
    searchResults,
    searchingMessages,
    uploadingFile,
    chatError,
    isConnected,
    mySocketId,
    roomSubtitle,
    hasMoreMessages,
    loadingMoreMessages,
    setReplyTarget,
    setNewMessage: handleMessageChange,
    sendMessage,
    uploadFile,
    submitEditMessage,
    deleteMessage,
    loadOlderMessages,
    searchMessages,
    clearSearch,
    loadRoomMembers,
    resetChatState,
  };
}
