import { DEFAULT_CLIENT_ORIGIN } from "./constants.js";

export const parseOrigins = (rawValue) =>
  (rawValue || DEFAULT_CLIENT_ORIGIN)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
