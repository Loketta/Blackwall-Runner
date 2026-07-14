"use strict";

const { WorldManager } = require(
  "../game/managers/worldManager"
);
const {
  WorldRepository
} = require("../game/repositories/worldRepository");

const DEFAULT_WORLD = Object.freeze({
  worldId: "development-world",
  name: "Development World",
  templateId: "cyberpunk-default"
});

function requireRepository(repository) {
  if (
    !repository ||
    typeof repository.load !== "function" ||
    typeof repository.create !== "function"
  ) {
    throw new TypeError(
      "worldRepository must provide load and create functions."
    );
  }
}

function requireManagerFactory(worldManagerFactory) {
  if (typeof worldManagerFactory !== "function") {
    throw new TypeError(
      "worldManagerFactory must be a function."
    );
  }
}

function requireClock(clock) {
  if (typeof clock !== "function") {
    throw new TypeError("clock must be a function.");
  }
}

function bootstrapWorld({
  worldId = DEFAULT_WORLD.worldId,
  worldName = DEFAULT_WORLD.name,
  templateId = DEFAULT_WORLD.templateId,
  worldRepository = new WorldRepository(),
  worldManagerFactory = (options) =>
    new WorldManager(options),
  clock = () => new Date()
} = {}) {
  requireRepository(worldRepository);
  requireManagerFactory(worldManagerFactory);
  requireClock(clock);

  let world = worldRepository.load(worldId);
  let created = false;

  if (world === null) {
    const createdAt = clock();

    if (
      !(createdAt instanceof Date) ||
      Number.isNaN(createdAt.getTime())
    ) {
      throw new TypeError(
        "clock must return a valid Date."
      );
    }

    world = worldRepository.create({
      worldId,
      name: worldName,
      templateId,
      createdAt: createdAt.toISOString()
    });

    created = true;
  }

  const worldManager = worldManagerFactory({
    worlds: [world],
    activeWorldId: world.worldId
  });

  if (
    !worldManager ||
    typeof worldManager.getActiveWorld !== "function"
  ) {
    throw new TypeError(
      "worldManagerFactory must return a world manager."
    );
  }

  return Object.freeze({
    world,
    worldManager,
    created
  });
}

module.exports = {
  bootstrapWorld,
  DEFAULT_WORLD
};
