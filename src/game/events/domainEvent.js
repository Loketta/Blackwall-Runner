"use strict";

function cloneAndFreeze(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(cloneAndFreeze));
  }

  if (value !== null && typeof value === "object") {
    const clone = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      clone[key] = cloneAndFreeze(nestedValue);
    }

    return Object.freeze(clone);
  }

  return value;
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }
}

function requireNullableString(value, fieldName) {
  if (value !== null) {
    requireNonEmptyString(value, fieldName);
  }
}

class DomainEvent {
  constructor({
    eventId,
    type,
    worldTime,
    actorId = null,
    targetIds = [],
    locationId = null,
    visibility = "public",
    payload = {},
    parentEventId = null,
    causationId = null,
    metadata = {}
  }) {
    requireNonEmptyString(eventId, "eventId");
    requireNonEmptyString(type, "type");
    requireNonEmptyString(worldTime, "worldTime");
    requireNullableString(actorId, "actorId");
    requireNullableString(locationId, "locationId");
    requireNonEmptyString(visibility, "visibility");
    requireNullableString(parentEventId, "parentEventId");
    requireNullableString(causationId, "causationId");

    if (!Array.isArray(targetIds)) {
      throw new TypeError("targetIds must be an array.");
    }

    for (const targetId of targetIds) {
      requireNonEmptyString(targetId, "targetIds entry");
    }

    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
      throw new TypeError("payload must be an object.");
    }

    if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new TypeError("metadata must be an object.");
    }

    this.eventId = eventId;
    this.type = type;
    this.worldTime = worldTime;
    this.actorId = actorId;
    this.targetIds = cloneAndFreeze(targetIds);
    this.locationId = locationId;
    this.visibility = visibility;
    this.payload = cloneAndFreeze(payload);
    this.parentEventId = parentEventId;
    this.causationId = causationId;
    this.metadata = cloneAndFreeze(metadata);

    Object.freeze(this);
  }
}

module.exports = {
  DomainEvent
};
