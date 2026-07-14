"use strict";

const fs = require("fs");
const path = require("path");
const {
  createJsonCollectionRepository
} = require("../repositories/jsonCollectionRepository");
const {
  getWorldObjectStateFilePath
} = require("../world/worldObjectStatePaths");

const defaultSavesDirectory = path.resolve(
  __dirname,
  "../../../saves"
);

const savesDirectory =
  process.env.BLACKWALL_SAVES_DIRECTORY ||
  defaultSavesDirectory;

const worldObjectStatePath =
  getWorldObjectStateFilePath({
    savesDirectory
  });

const worldObjectTemplatePath = path.resolve(
  __dirname,
  "../../../data/worldObjects/worldObjects.json"
);

function seedWorldObjectStateIfMissing() {
  if (fs.existsSync(worldObjectStatePath)) {
    return;
  }

  fs.mkdirSync(
    path.dirname(worldObjectStatePath),
    { recursive: true }
  );

  fs.copyFileSync(
    worldObjectTemplatePath,
    worldObjectStatePath
  );
}

seedWorldObjectStateIfMissing();

const worldObjectRepository =
  createJsonCollectionRepository({
    filePath: worldObjectStatePath,
    indentation: 2
  });

function loadWorldObjects() {
  return worldObjectRepository.loadAll();
}

function saveWorldObjects(worldObjects) {
  return worldObjectRepository.saveAll(worldObjects);
}

function loadWorldObject(objectId) {
  return worldObjectRepository.loadById(objectId);
}

function saveWorldObject(updatedObject) {
  return worldObjectRepository.update(updatedObject);
}

module.exports = {
  loadWorldObjects,
  saveWorldObjects,
  loadWorldObject,
  saveWorldObject
};