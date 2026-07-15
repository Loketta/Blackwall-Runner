"use strict";

const fs = require("fs");
const path = require("path");

const {
  createJsonDirectoryRepository
} = require("../repositories/jsonDirectoryRepository");

const {
  CHARACTER_DRAFT_STATUS
} = require("./characterDraft");

const {
  getCharacterDraftStateDirectory
} = require("../world/characterDraftStatePaths");

class CharacterDraftRepositoryError extends Error {
  constructor(code, message) {
    super(message);

    this.name = "CharacterDraftRepositoryError";
    this.code = code;
  }
}

function createRepositoryError(code, message) {
  return new CharacterDraftRepositoryError(
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

function requireDraft(draft) {
  if (!draft || typeof draft !== "object") {
    throw createRepositoryError(
      "invalid_draft",
      "Character draft must be an object."
    );
  }

  requireNonEmptyString(draft.id, "draft.id");
  requireNonEmptyString(
    draft.ownerId,
    "draft.ownerId"
  );
  requireNonEmptyString(
    draft.platform,
    "draft.platform"
  );
  requireNonEmptyString(
    draft.worldId,
    "draft.worldId"
  );

  if (!Number.isInteger(draft.revision)) {
    throw createRepositoryError(
      "invalid_revision",
      "Character draft revision must be a whole number."
    );
  }

  return draft;
}

function createCharacterDraftRepository({
  savesDirectory,
  worldId
}) {
  const normalisedWorldId =
    requireNonEmptyString(worldId, "worldId");

  const directoryPath =
    getCharacterDraftStateDirectory({
      savesDirectory,
      worldId: normalisedWorldId
    });

  fs.mkdirSync(directoryPath, {
    recursive: true
  });

  const repository =
    createJsonDirectoryRepository({
      directoryPath,
      indentation: 2
    });

  function create(draft) {
    requireDraft(draft);

    if (draft.worldId !== normalisedWorldId) {
      throw createRepositoryError(
        "wrong_world",
        `Draft ${draft.id} belongs to world ${draft.worldId}, not ${normalisedWorldId}.`
      );
    }

    if (repository.exists(draft.id)) {
      throw createRepositoryError(
        "draft_already_exists",
        `Character draft ${draft.id} already exists.`
      );
    }

    return repository.save(draft);
  }

  function load(draftId) {
    const normalisedDraftId =
      requireNonEmptyString(
        draftId,
        "draftId"
      );

    if (!repository.exists(normalisedDraftId)) {
      return null;
    }

    return repository.load(
      normalisedDraftId
    );
  }

  function save(draft, expectedRevision) {
    requireDraft(draft);

    if (!Number.isInteger(expectedRevision)) {
      throw createRepositoryError(
        "invalid_expected_revision",
        "Expected revision must be a whole number."
      );
    }

    if (draft.worldId !== normalisedWorldId) {
      throw createRepositoryError(
        "wrong_world",
        `Draft ${draft.id} belongs to world ${draft.worldId}, not ${normalisedWorldId}.`
      );
    }

    if (!repository.exists(draft.id)) {
      throw createRepositoryError(
        "draft_not_found",
        `Character draft ${draft.id} does not exist.`
      );
    }

    const persisted = repository.load(
      draft.id
    );

    if (
      persisted.revision !==
      expectedRevision
    ) {
      throw createRepositoryError(
        "draft_revision_conflict",
        `Expected persisted revision ${expectedRevision}, but found ${persisted.revision}.`
      );
    }

    if (
      draft.revision !==
      expectedRevision + 1
    ) {
      throw createRepositoryError(
        "invalid_next_revision",
        `The next draft revision must be ${expectedRevision + 1}.`
      );
    }

    return repository.save(draft);
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

  function findActiveByOwner({
    ownerId,
    platform,
    worldId: requestedWorldId
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

    if (
      requestedWorldId !== undefined &&
      requestedWorldId !==
        normalisedWorldId
    ) {
      return null;
    }

    const matches = list()
      .filter(
        (draft) =>
          draft.ownerId ===
            normalisedOwnerId &&
          draft.platform ===
            normalisedPlatform &&
          draft.status ===
            CHARACTER_DRAFT_STATUS.IN_PROGRESS
      )
      .sort(
        (left, right) =>
          right.revision - left.revision
      );

    return matches[0] ?? null;
  }

  return Object.freeze({
    create,
    load,
    save,
    list,
    findActiveByOwner
  });
}

module.exports = {
  CharacterDraftRepositoryError,
  createCharacterDraftRepository
};