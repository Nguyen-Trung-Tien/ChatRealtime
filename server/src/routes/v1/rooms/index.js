import { Router } from "express";
import { applyCreateRoomRoute } from "./routes/createRoomRoute.js";
import { applyDeleteMessageRoute } from "./routes/deleteMessageRoute.js";
import { applyDeleteRoomRoute } from "./routes/deleteRoomRoute.js";
import { applyGetRoomMessagesRoute } from "./routes/getRoomMessagesRoute.js";
import { applyGetRoomMembersRoute } from "./routes/getRoomMembersRoute.js";
import { applyGetRoomsHistoryRoute } from "./routes/getRoomsHistoryRoute.js";
import { applyJoinRoomRoute } from "./routes/joinRoomRoute.js";
import { applyLeaveRoomRoute } from "./routes/leaveRoomRoute.js";
import { applySearchMessagesRoute } from "./routes/searchMessagesRoute.js";
import { applyUploadRoomFileRoute } from "./routes/uploadRoomFileRoute.js";
import { applyUpdateMemberRoleRoute } from "./routes/updateMemberRoleRoute.js";
import { applyUpdateMessageRoute } from "./routes/updateMessageRoute.js";

const roomV1Routes = Router();

applyGetRoomsHistoryRoute(roomV1Routes);
applyCreateRoomRoute(roomV1Routes);
applyJoinRoomRoute(roomV1Routes);
applyLeaveRoomRoute(roomV1Routes);
applyGetRoomMessagesRoute(roomV1Routes);
applySearchMessagesRoute(roomV1Routes);
applyGetRoomMembersRoute(roomV1Routes);
applyUpdateMemberRoleRoute(roomV1Routes);
applyUpdateMessageRoute(roomV1Routes);
applyDeleteMessageRoute(roomV1Routes);
applyUploadRoomFileRoute(roomV1Routes);
applyDeleteRoomRoute(roomV1Routes);

export default roomV1Routes;
