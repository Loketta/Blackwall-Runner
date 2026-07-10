const path = require("path");
const {
  createJsonFileRepository
} = require("../repositories/jsonFileRepository");

const worldRepository = createJsonFileRepository({
  filePath: path.join(
    __dirname,
    "../../../data/World/world.json"
  ),
  indentation: 2
});

function loadWorld() {
  return worldRepository.load();
}

function saveWorld(world) {
  return worldRepository.save(world);
}

module.exports = {
  loadWorld,
  saveWorld
};
