const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const UPLOAD_MAX_BYTES = parsePositiveInt(process.env.UPLOAD_MAX_BYTES, 5 * 1024 * 1024);
export const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || "uploads";
