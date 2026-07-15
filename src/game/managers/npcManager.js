"use strict";

const fs = require("fs");
const path = require("path");
const {
  createJsonCollectionRepository
} = require("../repositories/jsonCollectionRepository");
const {
  getNpcStateFilePath
} = require("../world/npcStatePaths");

const defaultSavesDirectory = path.resolve(
  __dirname,
  "../../../saves"
);

const savesDirectory =
  process.env.BLACKWALL_SAVES_DIRECTORY ||
  defaultSavesDirectory;

const npcStatePath = getNpcStateFilePath({
  savesDirectory
});

const npcTemplatePath = path.resolve(
  __dirname,
  "../../../data/npcs/npcs.json"
);

function seedNpcStateIfMissing() {
  if (fs.existsSync(npcStatePath)) {
    return;
  }

  fs.mkdirSync(
    path.dirname(npcStatePath),
    { recursive: true }
  );

  fs.copyFileSync(
    npcTemplatePath,
    npcStatePath
  );
}

seedNpcStateIfMissing();

const npcRepository =
  createJsonCollectionRepository({
    filePath: npcStatePath,
    indentation: 2
  });

function loadNpcs() {
  return npcRepository.loadAll();
}

function loadNpc(npcId) {
  return npcRepository.loadById(npcId);
}

module.exports = {
  loadNpcs,
  loadNpc
};