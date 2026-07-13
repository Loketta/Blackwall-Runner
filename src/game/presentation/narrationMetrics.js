"use strict";

function requireBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new TypeError(
      `${fieldName} must be a boolean.`
    );
  }
}

function requireNonNegativeInteger(
  value,
  fieldName
) {
  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new TypeError(
      `${fieldName} must be a non-negative integer.`
    );
  }
}

function requireNonNegativeNumber(
  value,
  fieldName
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new TypeError(
      `${fieldName} must be a non-negative number.`
    );
  }
}

class NarrationMetrics {
  #requests;
  #generated;
  #cached;
  #cacheHits;
  #cacheMisses;
  #apiRequests;
  #inputTokens;
  #outputTokens;
  #totalTokens;
  #totalApiLatencyMs;

  constructor() {
    this.reset();
  }

  recordGenerated({
    cacheMiss = false,
    apiRequest = false,
    inputTokens = 0,
    outputTokens = 0,
    totalTokens = 0,
    latencyMs = 0
  } = {}) {
    requireBoolean(
      cacheMiss,
      "cacheMiss"
    );
    requireBoolean(
      apiRequest,
      "apiRequest"
    );
    requireNonNegativeInteger(
      inputTokens,
      "inputTokens"
    );
    requireNonNegativeInteger(
      outputTokens,
      "outputTokens"
    );
    requireNonNegativeInteger(
      totalTokens,
      "totalTokens"
    );
    requireNonNegativeNumber(
      latencyMs,
      "latencyMs"
    );

    if (
      !apiRequest &&
      (
        inputTokens > 0 ||
        outputTokens > 0 ||
        totalTokens > 0 ||
        latencyMs > 0
      )
    ) {
      throw new RangeError(
        "API usage requires apiRequest to be true."
      );
    }

    this.#requests += 1;
    this.#generated += 1;

    if (cacheMiss) {
      this.#cacheMisses += 1;
    }

    if (apiRequest) {
      this.#apiRequests += 1;
      this.#inputTokens += inputTokens;
      this.#outputTokens += outputTokens;
      this.#totalTokens += totalTokens;
      this.#totalApiLatencyMs += latencyMs;
    }

    return this.snapshot();
  }

  recordCached() {
    this.#requests += 1;
    this.#cached += 1;
    this.#cacheHits += 1;

    return this.snapshot();
  }

  snapshot() {
    const cacheLookups =
      this.#cacheHits + this.#cacheMisses;

    const cacheHitRate =
      cacheLookups === 0
        ? 0
        : this.#cacheHits / cacheLookups;

    const averageApiLatencyMs =
      this.#apiRequests === 0
        ? 0
        : this.#totalApiLatencyMs /
          this.#apiRequests;

    return Object.freeze({
      requests: this.#requests,
      generated: this.#generated,
      cached: this.#cached,
      cacheHits: this.#cacheHits,
      cacheMisses: this.#cacheMisses,
      cacheHitRate,
      apiRequests: this.#apiRequests,
      inputTokens: this.#inputTokens,
      outputTokens: this.#outputTokens,
      totalTokens: this.#totalTokens,
      totalApiLatencyMs:
        this.#totalApiLatencyMs,
      averageApiLatencyMs
    });
  }

  reset() {
    this.#requests = 0;
    this.#generated = 0;
    this.#cached = 0;
    this.#cacheHits = 0;
    this.#cacheMisses = 0;
    this.#apiRequests = 0;
    this.#inputTokens = 0;
    this.#outputTokens = 0;
    this.#totalTokens = 0;
    this.#totalApiLatencyMs = 0;
  }
}

module.exports = {
  NarrationMetrics
};
