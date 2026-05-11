import { DEFAULT_CLIENT_ORIGIN } from "./constants.js";
import { parseOrigins } from "./parseOrigins.js";

export const allowedClientOrigins = parseOrigins(process.env.CLIENT_ORIGIN);
export const CLIENT_ORIGIN = allowedClientOrigins[0] || DEFAULT_CLIENT_ORIGIN;

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedClientOrigins.includes(origin);
};
