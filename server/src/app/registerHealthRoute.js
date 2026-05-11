import { snapshotMetrics } from "../services/metricsService.js";

export const registerHealthRoute = (app) => {
  app.get("/", (req, res) => {
    res.json({ ok: true, service: "Realtime chat server", requestId: req.requestId });
  });

  app.get("/health", (req, res) => {
    res.json({
      ok: true,
      service: "Realtime chat server",
      requestId: req.requestId,
      now: new Date().toISOString(),
    });
  });

  app.get("/metrics", (req, res) => {
    res.json(snapshotMetrics());
  });
};
