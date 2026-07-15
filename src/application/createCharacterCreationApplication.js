"use strict";

const crypto = require("crypto");

const {
  createCharacterDraftRepository
} = require("../game/characterCreation/characterDraftRepository");

const {
  createCharacterRepository
} = require("../game/characterCreation/characterRepository");

const {
  createCharacterCreationService
} = require("../game/characterCreation/characterCreationService");

const {
  createCharacterFinalizationService
} = require("../game/characterCreation/characterFinalizationService");

function requireNonEmptyString(value, fieldName) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }

  return value.trim();
}

function createDefaultDraftId() {
  return `draft-${crypto.randomUUID()}`;
}

function createDefaultCharacterId() {
  return `character-${crypto.randomUUID()}`;
}

function createCharacterCreationApplication({
  savesDirectory,
  worldId,
  createDraftId = createDefaultDraftId,
  createCharacterId = createDefaultCharacterId
}) {
  const normalisedWorldId =
    requireNonEmptyString(worldId, "worldId");

  if (typeof createDraftId !== "function") {
    throw new TypeError(
      "createDraftId must be a function."
    );
  }

  if (typeof createCharacterId !== "function") {
    throw new TypeError(
      "createCharacterId must be a function."
    );
  }

  const draftRepository =
    createCharacterDraftRepository({
      savesDirectory,
      worldId: normalisedWorldId
    });

  const characterRepository =
    createCharacterRepository({
      savesDirectory,
      worldId: normalisedWorldId
    });

  const creationService =
    createCharacterCreationService({
      repository: draftRepository,
      createDraftId
    });

  const finalizationService =
    createCharacterFinalizationService({
      draftRepository,
      characterRepository,
      createCharacterId
    });

  function startOrResume({
    ownerId,
    platform
  }) {
    return creationService.startOrResume({
      ownerId,
      platform,
      worldId: normalisedWorldId
    });
  }

  function loadDraft(draftId) {
    return draftRepository.load(draftId);
  }

  function listCharactersByOwner({
    ownerId,
    platform
  }) {
    return characterRepository.findByOwner({
      ownerId,
      platform
    });
  }

  return Object.freeze({
    worldId: normalisedWorldId,
    startOrResume,
    loadDraft,
    setName: creationService.setName,
    setAttribute: creationService.setAttribute,
    setSkill: creationService.setSkill,
    setProfession:
      creationService.setProfession,
    setProfessionChoice:
      creationService.setProfessionChoice,
    validate: creationService.validate,
    finalise: finalizationService.finalise,
    listCharactersByOwner
  });
}

module.exports = {
  createCharacterCreationApplication
};