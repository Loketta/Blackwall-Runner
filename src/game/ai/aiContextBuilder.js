"use strict";

const {
  loadLocation
} = require("../managers/locationManager");
const {
  loadNpc
} = require("../managers/npcManager");
const {
  loadItem
} = require("../managers/itemManager");
const {
  loadWorldObject
} = require("../managers/worldObjectManager");
const {
  loadShops
} = require("../managers/shopManager");

function cloneAndFreeze(value) {
  if (Array.isArray(value)) {
    return Object.freeze(
      value.map(cloneAndFreeze)
    );
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

function requireObject(value, fieldName) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new TypeError(
      `${fieldName} must be an object.`
    );
  }
}

class AIContextBuilder {
  #loadLocation;
  #loadNpc;
  #loadItem;
  #loadWorldObject;
  #loadShops;

  constructor({
    loadLocationService = loadLocation,
    loadNpcService = loadNpc,
    loadItemService = loadItem,
    loadWorldObjectService = loadWorldObject,
    loadShopsService = loadShops
  } = {}) {
    const services = [
      ["loadLocationService", loadLocationService],
      ["loadNpcService", loadNpcService],
      ["loadItemService", loadItemService],
      ["loadWorldObjectService", loadWorldObjectService],
      ["loadShopsService", loadShopsService]
    ];

    for (const [name, service] of services) {
      if (typeof service !== "function") {
        throw new TypeError(
          `${name} must be a function.`
        );
      }
    }

    this.#loadLocation = loadLocationService;
    this.#loadNpc = loadNpcService;
    this.#loadItem = loadItemService;
    this.#loadWorldObject =
      loadWorldObjectService;
    this.#loadShops = loadShopsService;
  }

  build({
    player,
    world,
    eventHistory = null,
    recentEventLimit = 10
  }) {
    requireObject(player, "player");
    requireObject(world, "world");

    if (
      typeof player.location !== "string" ||
      player.location.trim() === ""
    ) {
      throw new TypeError(
        "player.location must be a non-empty string."
      );
    }

    if (
      !Number.isInteger(recentEventLimit) ||
      recentEventLimit < 0
    ) {
      throw new TypeError(
        "recentEventLimit must be a non-negative integer."
      );
    }

    if (
      eventHistory !== null &&
      typeof eventHistory.getRecent !== "function"
    ) {
      throw new TypeError(
        "eventHistory must provide a getRecent function."
      );
    }

    const location =
      this.#loadLocation(player.location);

    if (!location) {
      throw new Error(
        `Location "${player.location}" could not be loaded.`
      );
    }

    const nearbyNpcs = (location.npcs || [])
      .map((npcId) => this.#loadNpc(npcId))
      .filter(Boolean);

    const nearbyItems = (location.items || [])
      .map((itemId) => this.#loadItem(itemId))
      .filter(Boolean);

    const nearbyObjects = (location.objects || [])
      .map((objectId) => {
        return this.#loadWorldObject(objectId);
      })
      .filter(Boolean);

    const nearbyShops = this.#loadShops()
      .filter((shop) => {
        return shop.locationId === location.id;
      });

    const recentEvents = eventHistory
      ? eventHistory.getRecent(recentEventLimit)
      : [];

    return cloneAndFreeze({
      player,
      world,
      location,
      nearbyNpcs,
      nearbyItems,
      nearbyObjects,
      nearbyShops,
      recentEvents
    });
  }
}

module.exports = {
  AIContextBuilder
};
