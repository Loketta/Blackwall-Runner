"use strict";

const WORLD_STATUSES = Object.freeze([
  "active",
  "archived"
]);

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
}

function requireWorldId(value) {
  const worldId = requireNonEmptyString(value, "worldId");

  if (!/^[a-z0-9][a-z0-9_-]*$/.test(worldId)) {
    throw new TypeError(
      "worldId may contain only lowercase letters, numbers, hyphens and underscores."
    );
  }

  return worldId;
}

function requireIsoDate(value) {
  const createdAt = requireNonEmptyString(value, "createdAt");

  if (Number.isNaN(Date.parse(createdAt))) {
    throw new TypeError("createdAt must be a valid ISO date string.");
  }

  return createdAt;
}

function requireCampaignId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return requireNonEmptyString(value, "currentCampaignId");
}

class World {
  constructor({
    worldId,
    name,
    templateId,
    createdAt,
    currentCampaignId = null,
    status = "active"
  }) {
    this.worldId = requireWorldId(worldId);
    this.name = requireNonEmptyString(name, "name");
    this.templateId = requireNonEmptyString(templateId, "templateId");
    this.createdAt = requireIsoDate(createdAt);
    this.currentCampaignId = requireCampaignId(currentCampaignId);

    if (!WORLD_STATUSES.includes(status)) {
      throw new TypeError(
        `status must be one of: ${WORLD_STATUSES.join(", ")}.`
      );
    }

    this.status = status;

    Object.freeze(this);
  }

  toJSON() {
    return {
      worldId: this.worldId,
      name: this.name,
      templateId: this.templateId,
      createdAt: this.createdAt,
      currentCampaignId: this.currentCampaignId,
      status: this.status
    };
  }
}

module.exports = {
  World,
  WORLD_STATUSES
};
