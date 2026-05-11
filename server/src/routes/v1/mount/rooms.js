import roomV1Routes from "../rooms/index.js";

export const mountRoomV1Routes = (router) => {
  router.use("/rooms", roomV1Routes);
};
