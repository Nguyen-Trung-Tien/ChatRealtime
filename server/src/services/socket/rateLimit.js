const buckets = new Map();

const pruneExpiredBucket = (bucket, windowMs, currentTime) => {
  while (bucket.length > 0 && currentTime - bucket[0] >= windowMs) {
    bucket.shift();
  }
};

const hit = ({ key, windowMs, max }) => {
  const currentTime = Date.now();
  const bucket = buckets.get(key) || [];
  pruneExpiredBucket(bucket, windowMs, currentTime);

  if (bucket.length >= max) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.push(currentTime);
  buckets.set(key, bucket);
  return true;
};

export const consumeSocketRateLimit = ({ key, windowMs, max }) => {
  if (!key || !windowMs || !max) {
    return false;
  }
  return hit({ key, windowMs, max });
};

export const __resetSocketRateLimitBucketsForTest = () => {
  buckets.clear();
};
