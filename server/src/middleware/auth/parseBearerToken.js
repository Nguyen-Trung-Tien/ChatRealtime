export const parseBearerToken = (authHeader) => {
  const header = (authHeader || "").toString();
  return header.startsWith("Bearer ") ? header.slice(7) : null;
};
