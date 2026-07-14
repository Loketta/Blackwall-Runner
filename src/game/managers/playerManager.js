"use strict";

const fs = require("fs");
const path = require("path");
const {
  createJsonFileRepository
} = require("../repositories/jsonFileRepository");
const {
  getPlayerStateFilePath
} = require("../world/playerStatePaths");

const savesDirectory =
  process.env.BLACKWALL_SAVES_DIRECTORY ??
  path.join(__dirname, "../../../saves");

const playerStatePath = getPlayerStateFilePath({
  savesDirectory
});

const templatePlayerPath = path.join(
  __dirname,
  "../../../data/players/runner.json"
);

function ensurePlayerState() {
  if (fs.existsSync(playerStatePath)) {
    return;
  }

  fs.mkdirSync(
    path.dirname(playerStatePath),
    { recursive: true }
  );

  fs.copyFileSync(
    templatePlayerPath,
    playerStatePath
  );
}

const playerRepository = createJsonFileRepository({
  filePath: playerStatePath,
  indentation: 4
});

function loadPlayer() {
  ensurePlayerState();
  return playerRepository.load();
}

function savePlayer(player) {
  ensurePlayerState();
  return playerRepository.save(player);
}

module.exports = {
  loadPlayer,
  savePlayer
};
