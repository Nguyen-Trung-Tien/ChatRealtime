import { handleDisconnect } from "./handlers/disconnectHandler.js";
import { handleEditMessage } from "./handlers/editMessageHandler.js";
import { handleJoinRoom } from "./handlers/joinRoomHandler.js";
import { handleDeleteMessage } from "./handlers/deleteMessageHandler.js";
import { handleSendMessage } from "./handlers/sendMessageHandler.js";
import { handleTyping } from "./handlers/typingHandler.js";

export const registerSocketHandlers = ({ io, users, socket }) => {
  const authUser = socket.data.authUser;

  console.log(`User connected: ${authUser.username} (${socket.id})`);

  socket.on("join_room", (payload) => {
    handleJoinRoom({ io, users, socket, authUser, payload });
  });

  socket.on("send_message", (payload) => {
    handleSendMessage({ io, users, socket, payload });
  });

  socket.on("typing", (payload) => {
    handleTyping({ io, users, socket, payload });
  });

  socket.on("edit_message", (payload) => {
    handleEditMessage({ io, users, socket, payload });
  });

  socket.on("delete_message", (payload) => {
    handleDeleteMessage({ io, users, socket, payload });
  });

  socket.on("disconnect", () => {
    handleDisconnect({ io, users, socket });
  });
};
