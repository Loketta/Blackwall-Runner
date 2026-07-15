"use strict";

const fs = require("fs");
const path = require("path");
const {
  createJsonDirectoryRepository
} = require("./jsonDirectoryRepository");
const {
  getLocationStateDirectory
} = require("../world/locationStatePaths");

const defaultSavesDirectory = path.resolve(
  __dirname,
  "../../../saves"
);

function createLocationStateRepository(
  options = {}
) {
  const savesDirectory =
    options.savesDirectory ||
    process.env.BLACKWALL_SAVES_DIRECTORY ||
    defaultSavesDirectory;

  const directoryPath =
    getLocationStateDirectory({
      ...options,
      savesDirectory
    });

  const repository =
    createJsonDirectoryRepository({
      directoryPath,
      indentation: 2
    });

  function ensureDirectory() {
    fs.mkdirSync(directoryPath, {
      recursive: true
    });
  }

  function load(locationId) {
    return repository.load(locationId);
  }

  function save(locationState) {
    ensureDirectory();

    return repository.save(locationState);
  }

  function exists(locationId) {
    return repository.exists(locationId);
  }

  return {
    load,
    save,
    exists
  };
}

module.exports = {
  createLocationStateRepository
};