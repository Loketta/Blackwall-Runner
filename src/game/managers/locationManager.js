"use strict";

const path = require("path");
const {
  createJsonDirectoryRepository
} = require("../repositories/jsonDirectoryRepository");
const {
  createLocationStateRepository
} = require("../repositories/locationStateRepository");

const locationTemplateRepository =
  createJsonDirectoryRepository({
    directoryPath: path.join(
      __dirname,
      "../../../data/locations"
    ),
    indentation: 2
  });

const locationStateRepository =
  createLocationStateRepository();

function copyCollection(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...value];
}

function createInitialLocationState(template) {
  return {
    id: template.id,
    items: copyCollection(template.items),
    npcs: copyCollection(template.npcs),
    objects: copyCollection(template.objects)
  };
}

function normaliseLocationState(
  locationId,
  state
) {
  return {
    id: locationId,
    items: copyCollection(state.items),
    npcs: copyCollection(state.npcs),
    objects: copyCollection(state.objects)
  };
}

function loadLocationState(template) {
  if (
    locationStateRepository.exists(template.id)
  ) {
    return normaliseLocationState(
      template.id,
      locationStateRepository.load(template.id)
    );
  }

  const initialState =
    createInitialLocationState(template);

  locationStateRepository.save(initialState);

  return initialState;
}

function mergeLocation(template, state) {
  return {
    ...template,
    items: copyCollection(state.items),
    npcs: copyCollection(state.npcs),
    objects: copyCollection(state.objects)
  };
}

function loadLocation(locationId) {
  const template =
    locationTemplateRepository.load(locationId);

  const state = loadLocationState(template);

  return mergeLocation(template, state);
}

function saveLocation(location) {
  if (
    !location ||
    typeof location !== "object"
  ) {
    throw new TypeError(
      "Location must be an object."
    );
  }

  if (
    typeof location.id !== "string" ||
    location.id.trim() === ""
  ) {
    throw new TypeError(
      "Location requires a non-empty id."
    );
  }

  const state = normaliseLocationState(
    location.id,
    location
  );

  locationStateRepository.save(state);

  return location;
}

module.exports = {
  loadLocation,
  saveLocation
};