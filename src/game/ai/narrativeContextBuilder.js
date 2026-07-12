"use strict";

const {
  formatWorldTime
} = require("../time/worldTimeFormatter");

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

function mapCharacter(npc) {
  return {
    id: npc.id,
    name: npc.name,
    description: npc.description ?? null,
    role: npc.role ?? null
  };
}

function mapItem(item) {
  return {
    id: item.id,
    name: item.name,
    type: item.type ?? null,
    description: item.description ?? null
  };
}

function mapWorldObject(worldObject) {
  return {
    id: worldObject.id,
    name: worldObject.name,
    type: worldObject.type ?? null,
    description: worldObject.description ?? null,
    state: worldObject.state ?? {}
  };
}

function mapShop(shop) {
  return {
    id: shop.id,
    name: shop.name,
    description: shop.description ?? null,
    isOpen: shop.isOpen === true
  };
}

function mapEvent(event) {
  return {
    eventId: event.eventId,
    type: event.type,
    worldTime: event.worldTime,
    actorId: event.actorId ?? null,
    targetIds: event.targetIds ?? [],
    locationId: event.locationId ?? null,
    payload: event.payload ?? {}
  };
}

class NarrativeContextBuilder {
  build(aiContext) {
    requireObject(aiContext, "aiContext");
    requireObject(aiContext.player, "aiContext.player");
    requireObject(aiContext.world, "aiContext.world");
    requireObject(aiContext.location, "aiContext.location");

    const {
      player,
      world,
      location
    } = aiContext;

    if (!world.calendar) {
      throw new TypeError(
        "aiContext.world.calendar must be an object."
      );
    }

    const narrativeContext = {
      world: {
        id: world.id,
        name: world.name ?? null,
        city: world.city ?? null,
        day: world.day ?? null,
        time: formatWorldTime(world),
        weather: world.weather ?? null
      },

      player: {
        id: player.id,
        name: player.name,
        role: player.role ?? null,
        health: player.health ?? null,
        credits: player.credits ?? null,
        inventory: player.inventory ?? []
      },

      location: {
        id: location.id,
        name: location.name,
        type: location.type ?? null,
        description: location.description ?? null,
        exits: (location.exits ?? []).map((exit) => ({
          name: exit.name,
          destination: exit.destination,
          description: exit.description ?? null
        }))
      },

      visibleCharacters: (
        aiContext.nearbyNpcs ?? []
      ).map(mapCharacter),

      visibleItems: (
        aiContext.nearbyItems ?? []
      ).map(mapItem),

      visibleObjects: (
        aiContext.nearbyObjects ?? []
      ).map(mapWorldObject),

      visibleShops: (
        aiContext.nearbyShops ?? []
      ).map(mapShop),

      recentEvents: (
        aiContext.recentEvents ?? []
      ).map(mapEvent)
    };

    return cloneAndFreeze(narrativeContext);
  }
}

module.exports = {
  NarrativeContextBuilder
};
