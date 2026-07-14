"use strict";

const fs = require("fs");
const path = require("path");
const { World } = require("../world/world");

class WorldRepository {
  constructor({
    rootDirectory = path.join("saves", "worlds"),
    fileSystem = fs
  } = {}) {
    if (
      typeof rootDirectory !== "string" ||
      rootDirectory.trim() === ""
    ) {
      throw new TypeError(
        "rootDirectory must be a non-empty string."
      );
    }

    if (
      !fileSystem ||
      typeof fileSystem.existsSync !== "function" ||
      typeof fileSystem.mkdirSync !== "function" ||
      typeof fileSystem.readFileSync !== "function" ||
      typeof fileSystem.writeFileSync !== "function" ||
      typeof fileSystem.readdirSync !== "function"
    ) {
      throw new TypeError(
        "fileSystem must provide the required filesystem operations."
      );
    }

    this.rootDirectory = rootDirectory;
    this.fileSystem = fileSystem;
  }

  create(worldData) {
    const world = this.#toWorld(worldData);

    if (this.exists(world.worldId)) {
      throw new Error(
        `World already exists: ${world.worldId}`
      );
    }

    this.#write(world);
    return world;
  }

  load(worldId) {
    const validatedWorldId = this.#validateWorldId(worldId);
    const filePath = this.#getFilePath(validatedWorldId);

    if (!this.fileSystem.existsSync(filePath)) {
      return null;
    }

    const storedWorld = JSON.parse(
      this.fileSystem.readFileSync(filePath, "utf8")
    );

    const world = new World(storedWorld);

    if (world.worldId !== validatedWorldId) {
      throw new Error(
        `World identity mismatch: expected ${validatedWorldId}, ` +
        `found ${world.worldId}.`
      );
    }

    return world;
  }

  list() {
    if (!this.fileSystem.existsSync(this.rootDirectory)) {
      return [];
    }

    return this.fileSystem
      .readdirSync(this.rootDirectory, {
        withFileTypes: true
      })
      .filter((entry) => entry.isDirectory())
      .map((entry) => this.load(entry.name))
      .filter((world) => world !== null)
      .sort((left, right) =>
        left.worldId.localeCompare(right.worldId)
      );
  }

  save(worldData) {
    const world = this.#toWorld(worldData);

    if (!this.exists(world.worldId)) {
      throw new Error(
        `World does not exist: ${world.worldId}`
      );
    }

    this.#write(world);
    return world;
  }

  exists(worldId) {
    const validatedWorldId = this.#validateWorldId(worldId);

    return this.fileSystem.existsSync(
      this.#getFilePath(validatedWorldId)
    );
  }

  #toWorld(value) {
    if (value instanceof World) {
      return value;
    }

    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      throw new TypeError(
        "World data must be a World or plain object."
      );
    }

    return new World(value);
  }

  #validateWorldId(worldId) {
    return new World({
      worldId,
      name: "Validation World",
      templateId: "validation",
      createdAt: "2000-01-01T00:00:00.000Z"
    }).worldId;
  }

  #getDirectoryPath(worldId) {
    return path.join(this.rootDirectory, worldId);
  }

  #getFilePath(worldId) {
    return path.join(
      this.#getDirectoryPath(worldId),
      "world.json"
    );
  }

  #write(world) {
    const directoryPath =
      this.#getDirectoryPath(world.worldId);

    this.fileSystem.mkdirSync(directoryPath, {
      recursive: true
    });

    this.fileSystem.writeFileSync(
      this.#getFilePath(world.worldId),
      `${JSON.stringify(world.toJSON(), null, 2)}\n`,
      "utf8"
    );
  }
}

module.exports = {
  WorldRepository
};
