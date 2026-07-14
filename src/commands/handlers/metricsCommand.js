"use strict";

function requireMetricsPipeline(
  services
) {
  const presentationPipeline =
    services?.presentationPipeline;

  if (
    !presentationPipeline ||
    typeof presentationPipeline.getMetrics !==
      "function"
  ) {
    throw new TypeError(
      "services.presentationPipeline must provide a getMetrics function."
    );
  }

  return presentationPipeline;
}

function formatPercentage(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMilliseconds(value) {
  return `${value.toFixed(0)} ms`;
}

function runMetricsCommand(
  services = {}
) {
  const presentationPipeline =
    requireMetricsPipeline(services);
  const log = services.log ?? console.log;

  const metrics =
    presentationPipeline.getMetrics();

  log("=== NARRATION METRICS ===");
  log("");
  log(`Requests: ${metrics.requests}`);
  log(`Generated: ${metrics.generated}`);
  log(`Cached: ${metrics.cached}`);
  log(`Cache Hits: ${metrics.cacheHits}`);
  log(`Cache Misses: ${metrics.cacheMisses}`);
  log(
    `Cache Hit Rate: ${
      formatPercentage(metrics.cacheHitRate)
    }`
  );
  log(`API Requests: ${metrics.apiRequests}`);
  log(`Input Tokens: ${metrics.inputTokens}`);
  log(`Output Tokens: ${metrics.outputTokens}`);
  log(`Total Tokens: ${metrics.totalTokens}`);
  log(
    `Total API Latency: ${
      formatMilliseconds(
        metrics.totalApiLatencyMs
      )
    }`
  );
  log(
    `Average API Latency: ${
      formatMilliseconds(
        metrics.averageApiLatencyMs
      )
    }`
  );
}

module.exports = {
  runMetricsCommand
};
