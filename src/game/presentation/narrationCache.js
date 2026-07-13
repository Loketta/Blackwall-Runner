"use strict";

const {
  NarrationSnapshot
} = require("./narrationSnapshot");

function normaliseCacheKeyPart(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }

  return value.trim();
}

function createCacheKey(fingerprint, mode) {
  return `${mode}::${fingerprint}`;
}

class NarrationCache {
  constructor() {
    this.snapshots = new Map();
  }

  store(snapshot) {
    if (!(snapshot instanceof NarrationSnapshot)) {
      throw new TypeError(
        "snapshot must be a NarrationSnapshot."
      );
    }

    const key = createCacheKey(
      snapshot.fingerprint,
      snapshot.mode
    );

    this.snapshots.set(key, snapshot);

    return snapshot;
  }

  find(fingerprint, mode) {
    const normalisedFingerprint = normaliseCacheKeyPart(
      fingerprint,
      "fingerprint"
    );
    const normalisedMode = normaliseCacheKeyPart(
      mode,
      "mode"
    );

    const key = createCacheKey(
      normalisedFingerprint,
      normalisedMode
    );

    return this.snapshots.get(key) || null;
  }

  clear() {
    this.snapshots.clear();
  }

  size() {
    return this.snapshots.size;
  }
}

module.exports = {
  NarrationCache
};
