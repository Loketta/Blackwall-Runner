const fs = require("fs");
const path = require("path");

const containersPath = path.join(
  __dirname,
  "../../data/containers/containers.json"
);

function loadContainers() {
  const fileData = fs.readFileSync(containersPath, "utf8");
  return JSON.parse(fileData);
}

function saveContainers(containers) {
  const fileData = JSON.stringify(containers, null, 2);
  fs.writeFileSync(containersPath, fileData);
}

function loadContainer(containerId) {
  const containers = loadContainers();

  return containers.find(function (container) {
    return container.id === containerId;
  });
}

function saveContainer(updatedContainer) {
  const containers = loadContainers();

  const containerIndex = containers.findIndex(function (container) {
    return container.id === updatedContainer.id;
  });

  if (containerIndex === -1) {
    return false;
  }

  containers[containerIndex] = updatedContainer;
  saveContainers(containers);

  return true;
}

module.exports = {
  loadContainers,
  saveContainers,
  loadContainer,
  saveContainer
};