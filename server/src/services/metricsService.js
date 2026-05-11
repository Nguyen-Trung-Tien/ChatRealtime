const state = {
  startedAt: Date.now(),
  totalRequests: 0,
  totalErrors: 0,
  byMethod: {},
  byRoute: {},
  byStatus: {},
};

const inc = (bag, key) => {
  bag[key] = (bag[key] || 0) + 1;
};

export const recordRequestMetric = ({ method, route, status }) => {
  state.totalRequests += 1;
  inc(state.byMethod, method || "UNKNOWN");
  inc(state.byRoute, route || "UNKNOWN");
  inc(state.byStatus, String(status || 0));
  if (Number(status) >= 500) {
    state.totalErrors += 1;
  }
};

export const snapshotMetrics = () => ({
  uptimeSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
  totalRequests: state.totalRequests,
  totalErrors: state.totalErrors,
  byMethod: state.byMethod,
  byRoute: state.byRoute,
  byStatus: state.byStatus,
});
