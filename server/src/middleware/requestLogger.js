import { recordRequestMetric } from "../services/metricsService.js";

export const requestLogger = (req, res, next) => {
  const startedAt = req.requestStartedAt || Date.now();
  const requestId = req.requestId || "unknown";

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const routeKey = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
    const status = res.statusCode;

    recordRequestMetric({
      method: req.method,
      route: routeKey,
      status,
    });

    console.log(
      JSON.stringify({
        level: status >= 500 ? "error" : "info",
        requestId,
        method: req.method,
        route: routeKey,
        status,
        durationMs,
      })
    );
  });

  next();
};
