import crypto from "node:crypto";

export const attachRequestContext = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.requestStartedAt = Date.now();
  res.setHeader("x-request-id", req.requestId);
  next();
};
