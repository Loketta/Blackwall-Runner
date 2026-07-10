const path = require("path");
const {
  createJsonDirectoryRepository
} = require("../repositories/jsonDirectoryRepository");

const locationRepository =
  createJsonDirectoryRepository({
    directoryPath: path.join(
      __dirname,
      "../../../data/locations"
    ),
    indentation: 2
  });

function loadLocation(locationId) {
  return locationRepository.load(locationId);
}

function saveLocation(location) {
  return locationRepository.save(location);
}

module.exports = {
  loadLocation,
  saveLocation
};
