const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET || "replace_me";

if (isProduction && jwtSecret === "replace_me") {
  throw new Error("JWT_SECRET must be set in production");
}

export const JWT_SECRET = jwtSecret;
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
