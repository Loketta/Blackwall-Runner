"use strict";

const {
  CHARACTER_CREATION_STAGE,
  CHARACTER_CREATION_STAGE_ORDER,
  isCharacterCreationStage
} = require("./characterCreationStages");

function createCharacterCreationStageMachine({
  initialStage = CHARACTER_CREATION_STAGE.NAME
} = {}) {
  if (!isCharacterCreationStage(initialStage)) {
    throw new Error(
      `Unknown character creation stage: ${initialStage}`
    );
  }

  let currentStage = initialStage;

  function getCurrentStageIndex() {
    return CHARACTER_CREATION_STAGE_ORDER.indexOf(
      currentStage
    );
  }

  function getCurrentStage() {
    return currentStage;
  }

  function canMoveNext() {
    return (
      currentStage !==
      CHARACTER_CREATION_STAGE.FINISHED
    );
  }

  function canMovePrevious() {
    return (
      currentStage !==
      CHARACTER_CREATION_STAGE.NAME
    );
  }

  function isComplete() {
    return (
      currentStage ===
      CHARACTER_CREATION_STAGE.FINISHED
    );
  }

  function next() {
    if (!canMoveNext()) {
      return currentStage;
    }

    currentStage =
      CHARACTER_CREATION_STAGE_ORDER[
        getCurrentStageIndex() + 1
      ];

    return currentStage;
  }

  function previous() {
    if (!canMovePrevious()) {
      return currentStage;
    }

    currentStage =
      CHARACTER_CREATION_STAGE_ORDER[
        getCurrentStageIndex() - 1
      ];

    return currentStage;
  }

  function moveTo(stage) {
    if (!isCharacterCreationStage(stage)) {
      throw new Error(
        `Unknown character creation stage: ${stage}`
      );
    }

    currentStage = stage;

    return currentStage;
  }

  function getState() {
    const stageIndex = getCurrentStageIndex();

    return Object.freeze({
      currentStage,
      stageIndex,
      stageNumber: stageIndex + 1,
      stageCount:
        CHARACTER_CREATION_STAGE_ORDER.length,
      canMoveNext: canMoveNext(),
      canMovePrevious: canMovePrevious(),
      complete: isComplete()
    });
  }

  return Object.freeze({
    getCurrentStage,
    getState,
    canMoveNext,
    canMovePrevious,
    isComplete,
    next,
    previous,
    moveTo
  });
}

module.exports = {
  createCharacterCreationStageMachine
};
