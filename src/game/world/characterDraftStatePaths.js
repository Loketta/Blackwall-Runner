"use strict";

const path = require("path");

const {
  getWorldStateDirectory
} = require("./worldStatePaths");

function requireDraftId(draftId) {
  if (
    typeof draftId !== "string" ||
    draftId.trim() === ""
  ) {
    throw new TypeError(
      "draftId must be a non-empty string."
    );
  }

  const normalisedDraftId = draftId.trim();

  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(
      normalisedDraftId
    )
  ) {
    throw new TypeError(
      "draftId may contain only letters, numbers, hyphens and underscores."
    );
  }

  return normalisedDraftId;
}

function getCharacterDraftStateDirectory(
  options = {}
) {
  return path.join(
    getWorldStateDirectory(options),
    "characterDrafts"
  );
}

function getCharacterDraftStateFilePath({
  draftId,
  ...worldOptions
} = {}) {
  return path.join(
    getCharacterDraftStateDirectory(
      worldOptions
    ),
    `${requireDraftId(draftId)}.json`
  );
}

module.exports = {
  getCharacterDraftStateDirectory,
  getCharacterDraftStateFilePath
};