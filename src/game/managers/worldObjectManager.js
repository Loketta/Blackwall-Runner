const path = require("path");
const {
  createJsonCollectionRepository
} = require("../repositories/jsonCollectionRepository");

const worldObjectRepository =
  createJsonCollectionRepository({
    filePath: path.join(
      __dirname,
      "../../../data/worldObjects/worldObjects.json"
    ),
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
