"use strict";

const fs = require("fs");
const path = require("path");
const { World } = require("../world/world");
const {
  createJsonFileRepository
} = require("../repositories/jsonFileRepository");
const {
  getWorldStateFilePath
} = require("../world/worldStatePaths");

const savesDirectory =
  process.env.BLACKWALL_SAVES_DIRECTORY ??
  path.join(__dirname, "../../../saves");

const worldStatePath = getWorldStateFilePath({
  savesDirectory
});

const templateWorldPath = path.join(
  __dirname,
  "../../../data/World/world.json"
);

function ensureWorldState() {
  if (fs.existsSync(worldStatePath)) {
    return;
  }

  fs.mkdirSync(
    path.dirname(worldStatePath),
    { recursive: true }
  );

  fs.copyFileSync(
    templateWorldPath,
    worldStatePath
  );
}

const worldRepository = createJsonFileRepository({
  filePath: worldStatePath,
  indentation: 2
});

function loadWorld() {
  ensureWorldState();
  return worldRepository.load();
}

function saveWorld(world) {
  ensureWorldState();
  return worldRepository.save(world);
}

class WorldManager {
  constructor({ worlds = [], activeWorldId = null } = {}) {
    if (!Array.isArray(worlds)) {
      throw new TypeError("worlds must be an array.");
    }

    this.worlds = new Map();
    this.activeWorldId = null;

    for (const world of worlds) {
      this.addWorld(world);
    }

    if (activeWorldId !== null) {
      this.selectWorld(activeWorldId);
    }
  }

  addWorld(worldData) {
    const world = this.#toWorld(worldData);

    if (this.worlds.has(world.worldId)) {
      throw new Error(`World already exists: ${world.worldId}`);
    }

    this.worlds.set(world.worldId, world);
    return world;
  }

  replaceWorld(worldData) {
    const world = this.#toWorld(worldData);

    if (!this.worlds.has(world.worldId)) {
      throw new Error(`World does not exist: ${world.worldId}`);
    }

    this.worlds.set(world.worldId, world);
    return world;
  }

  getWorld(worldId) {
    this.#requireWorldId(worldId);
    return this.worlds.get(worldId) || null;
  }

  listWorlds() {
    return Array.from(this.worlds.values()).sort((left, right) =>
      left.worldId.localeCompare(right.worldId)
    );
  }

  selectWorld(worldId) {
    this.#requireWorldId(worldId);

    if (!this.worlds.has(worldId)) {
      throw new Error(`World does not exist: ${worldId}`);
    }

    this.activeWorldId = worldId;
    return this.worlds.get(worldId);
  }

  getActiveWorld() {
    if (this.activeWorldId === null) {
      return null;
    }

    return this.worlds.get(this.activeWorldId) || null;
  }

  #toWorld(value) {
    if (value instanceof World) {
      return value;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError("World data must be a World or plain object.");
    }

    return new World(value);
  }

  #requireWorldId(worldId) {
    if (typeof worldId !== "string" || worldId.trim() === "") {
      throw new TypeError("worldId must be a non-empty string.");
    }
  }
}

module.exports = {
  WorldManager,
  loadWorld,
  saveWorld
};
