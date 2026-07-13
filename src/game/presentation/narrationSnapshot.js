"use strict";

function normaliseRequiredString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }

  return value.trim();
}

function normaliseTimestamp(value) {
  if (
    typeof value !== "string" &&
    !(value instanceof Date)
  ) {
    throw new TypeError(
      "createdAt must be a valid date or date string."
    );
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    throw new TypeError(
      "createdAt must be a valid date or date string."
    );
  }

  return timestamp.toISOString();
}

class NarrationSnapshot {
  constructor({
    fingerprint,
    mode,
    narration,
    source,
    model,
    createdAt
  }) {
    this.fingerprint = normaliseRequiredString(
      fingerprint,
      "fingerprint"
    );
    this.mode = normaliseRequiredString(
      mode,
      "mode"
    );
    this.narration = normaliseRequiredString(
      narration,
      "narration"
    );
    this.source = normaliseRequiredString(
      source,
      "source"
    );
    this.model = normaliseRequiredString(
      model,
      "model"
    );
    this.createdAt = normaliseTimestamp(createdAt);

    Object.freeze(this);
  }
}

module.exports = {
  NarrationSnapshot
};
