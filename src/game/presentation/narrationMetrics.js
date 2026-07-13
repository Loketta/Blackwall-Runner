"use strict";

class NarrationMetrics {
  #requests;
  #generated;
  #cached;
  #cacheHits;
  #cacheMisses;

  constructor() {
    this.reset();
  }

  recordGenerated({
    cacheMiss = false
  } = {}) {
    if (typeof cacheMiss !== "boolean") {
      throw new TypeError(
        "cacheMiss must be a boolean."
      );
    }

    this.#requests += 1;
    this.#generated += 1;

    if (cacheMiss) {
      this.#cacheMisses += 1;
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

    return Object.freeze({
      requests: this.#requests,
      generated: this.#generated,
      cached: this.#cached,
      cacheHits: this.#cacheHits,
      cacheMisses: this.#cacheMisses,
      cacheHitRate
    });
  }

  reset() {
    this.#requests = 0;
    this.#generated = 0;
    this.#cached = 0;
    this.#cacheHits = 0;
    this.#cacheMisses = 0;
  }
}

module.exports = {
  NarrationMetrics
};
