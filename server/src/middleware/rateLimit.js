const buckets = new Map();

const now = () => Date.now();

const pruneExpiredBucket = (bucket, windowMs, currentTime) => {
  while (bucket.length > 0 && currentTime - bucket[0] >= windowMs) {
    bucket.shift();
  }
};

export const createRateLimitMiddleware = ({
  keyPrefix,
  windowMs,
  max,
  message = "Too many requests, please try again later.",
}) => {
  if (!keyPrefix || !windowMs || !max) {
    throw new Error("Invalid rate limit configuration");
  }

  return (req, res, next) => {
    const id = req.authUser?.id || req.ip || "anonymous";
    const bucketKey = `${keyPrefix}:${id}`;
    const currentTime = now();
    const bucket = buckets.get(bucketKey) || [];

    pruneExpiredBucket(bucket, windowMs, currentTime);

    if (bucket.length >= max) {
      return res.status(429).json({ message });
    }

    bucket.push(currentTime);
    buckets.set(bucketKey, bucket);
    return next();
  };
};

export const __resetRateLimitBucketsForTest = () => {
  buckets.clear();
};
