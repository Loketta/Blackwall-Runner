const path = require("path");
const {
  createJsonCollectionRepository
} = require("../repositories/jsonCollectionRepository");

const npcRepository = createJsonCollectionRepository({
  filePath: path.join(
    __dirname,
    "../../../data/npcs/npcs.json"
  ),
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
