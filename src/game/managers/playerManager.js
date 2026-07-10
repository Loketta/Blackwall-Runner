const path = require("path");
const {
  createJsonFileRepository
} = require("../repositories/jsonFileRepository");

const playerRepository = createJsonFileRepository({
  filePath: path.join(
    __dirname,
    "../../../data/players/runner.json"
  ),
  indentation: 4
});

function loadPlayer() {
  return playerRepository.load();
}

function savePlayer(player) {
  return playerRepository.save(player);
}

module.exports = {
  loadPlayer,
  savePlayer
};
