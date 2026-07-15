"use strict";

const fs = require("fs");
const path = require("path");

const {
  createJsonDirectoryRepository
} = require("../repositories/jsonDirectoryRepository");

const {
  getPlayersDirectory
} = require("../world/playerStatePaths");

class CharacterRepositoryError extends Error {
  constructor(code, message) {
    super(message);

    this.name = "CharacterRepositoryError";
    this.code = code;
  }
}

function createRepositoryError(code, message) {
  return new CharacterRepositoryError(
    code,
    message
  );
}

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

function requireCharacter(character) {
  if (!character || typeof character !== "object") {
    throw createRepositoryError(
      "invalid_character",
      "Character must be an object."
    );
  }

  requireNonEmptyString(
    character.id,
    "character.id"
  );

  requireNonEmptyString(
    character.worldId,
    "character.worldId"
  );

  requireNonEmptyString(
    character.name,
    "character.name"
  );

  return character;
}

function createCharacterRepository({
  savesDirectory,
  worldId
}) {
  const normalisedWorldId =
    requireNonEmptyString(worldId, "worldId");

  const directoryPath = getPlayersDirectory({
    savesDirectory,
    worldId: normalisedWorldId
  });

  fs.mkdirSync(directoryPath, {
    recursive: true
  });

  const repository =
    createJsonDirectoryRepository({
      directoryPath,
      indentation: 4
    });

  function create(character) {
    requireCharacter(character);

    if (character.worldId !== normalisedWorldId) {
      throw createRepositoryError(
        "wrong_world",
        `Character ${character.id} belongs to world ${character.worldId}, not ${normalisedWorldId}.`
      );
    }

    if (repository.exists(character.id)) {
      throw createRepositoryError(
        "character_already_exists",
        `Character ${character.id} already exists.`
      );
    }

    const existingFromDraft =
      character.characterCreation?.draftId
        ? findByCreationDraftId(
            character.characterCreation.draftId
          )
        : null;

    if (existingFromDraft) {
      throw createRepositoryError(
        "creation_draft_already_used",
        `Character draft ${character.characterCreation.draftId} has already created character ${existingFromDraft.id}.`
      );
    }

    return repository.save(character);
  }

  function load(characterId) {
    const normalisedCharacterId =
      requireNonEmptyString(
        characterId,
        "characterId"
      );

    if (
      !repository.exists(
        normalisedCharacterId
      )
    ) {
      return null;
    }

    return repository.load(
      normalisedCharacterId
    );
  }

  function exists(characterId) {
    return repository.exists(
      requireNonEmptyString(
        characterId,
        "characterId"
      )
    );
  }

  function list() {
    return fs
      .readdirSync(directoryPath, {
        withFileTypes: true
      })
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".json")
      )
      .map(
        (entry) =>
          repository.load(
            path.basename(
              entry.name,
              ".json"
            )
          )
      );
  }

  function findByCreationDraftId(draftId) {
    const normalisedDraftId =
      requireNonEmptyString(
        draftId,
        "draftId"
      );

    return (
      list().find(
        (character) =>
          character.characterCreation?.draftId ===
          normalisedDraftId
      ) ?? null
    );
  }

  function findByOwner({
    ownerId,
    platform
  }) {
    const normalisedOwnerId =
      requireNonEmptyString(
        ownerId,
        "ownerId"
      );

    const normalisedPlatform =
      requireNonEmptyString(
        platform,
        "platform"
      );

    return list().filter(
      (character) =>
        character.ownerId ===
          normalisedOwnerId &&
        character.platform ===
          normalisedPlatform
    );
  }

  return Object.freeze({
    create,
    load,
    exists,
    list,
    findByCreationDraftId,
    findByOwner
  });
}

module.exports = {
  CharacterRepositoryError,
  createCharacterRepository
};