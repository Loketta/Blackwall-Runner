const fs = require("fs");
const path = require("path");

const worldObjectsPath = path.join(
  __dirname,
  "../../../data/worldObjects/worldObjects.json"
);

function loadWorldObjects() {
  const fileData = fs.readFileSync(worldObjectsPath, "utf8");
  return JSON.parse(fileData);
}

function saveWorldObjects(worldObjects) {
  const fileData = JSON.stringify(worldObjects, null, 2);
  fs.writeFileSync(worldObjectsPath, fileData);
}

function loadWorldObject(objectId) {
  const worldObjects = loadWorldObjects();

  return worldObjects.find(function (worldObject) {
    return worldObject.id === objectId;
  });
}

function saveWorldObject(updatedObject) {
  const worldObjects = loadWorldObjects();

  const objectIndex = worldObjects.findIndex(function (worldObject) {
    return worldObject.id === updatedObject.id;
  });

  if (objectIndex === -1) {
    return false;
  }

  worldObjects[objectIndex] = updatedObject;
  saveWorldObjects(worldObjects);

  return true;
}

module.exports = {
  loadWorldObjects,
  saveWorldObjects,
  loadWorldObject,
  saveWorldObject
};