"use strict";

const {
  createCharacterCreationController
} = require(
  "../../game/characterCreation/characterCreationController"
);

function requireNonEmptyString(
  value,
  fieldName
) {
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

function requireFunction(
  value,
  fieldName
) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }

  return value;
}

function requireApplication(application) {
  if (
    !application ||
    typeof application !== "object"
  ) {
    throw new TypeError(
      "application must be an object."
    );
  }

  return application;
}

function createDiscordCharacterCreationSession({
  application,
  createController =
    createCharacterCreationController,
  startingLocation,
  startingCredits = 0,
  startingInventory = []
}) {
  const characterCreationApplication =
    requireApplication(application);

  const controllerFactory =
    requireFunction(
      createController,
      "createController"
    );

  const normalisedStartingLocation =
    requireNonEmptyString(
      startingLocation,
      "startingLocation"
    );

  if (
    !Number.isFinite(startingCredits)
  ) {
    throw new TypeError(
      "startingCredits must be a finite number."
    );
  }

  if (!Array.isArray(startingInventory)) {
    throw new TypeError(
      "startingInventory must be an array."
    );
  }

  const controller =
    controllerFactory({
      application:
        characterCreationApplication
    });

  let ownerId = null;
  let platform = null;
  let currentView = null;

  function requireStarted() {
    if (
      ownerId === null ||
      currentView === null
    ) {
      throw new Error(
        "Discord character creation session has not started."
      );
    }
  }

  function start({
    ownerId: suppliedOwnerId,
    platform: suppliedPlatform = "discord"
  }) {
    if (currentView !== null) {
      throw new Error(
        "Discord character creation session has already started."
      );
    }

    ownerId =
      requireNonEmptyString(
        suppliedOwnerId,
        "ownerId"
      );

    platform =
      requireNonEmptyString(
        suppliedPlatform,
        "platform"
      );

    currentView = controller.start({
      ownerId,
      platform
    });

    return currentView;
  }

  function getCurrentView() {
    requireStarted();

    currentView =
      controller.renderCurrentStep();

    return currentView;
  }

  function submitName(name) {
    requireStarted();

    const normalisedName =
      requireNonEmptyString(
        name,
        "name"
      );

    if (currentView.stage !== "name") {
      throw new Error(
        "A character name can only be submitted during the name stage."
      );
    }

    controller.submit({
      value: normalisedName
    });

    currentView = controller.next();

    return currentView;
  }

  function setAttribute({
    attributeId,
    value
  }) {
    requireStarted();

    if (currentView.stage !== "attributes") {
      throw new Error(
        "Attributes can only be updated during the attributes stage."
      );
    }

    const normalisedAttributeId =
      requireNonEmptyString(
        attributeId,
        "attributeId"
      );

    if (!Number.isInteger(value)) {
      throw new TypeError(
        "value must be an integer."
      );
    }

    currentView =
      controller.submit({
        attributeId:
          normalisedAttributeId,
        value
      });

    return currentView;
  }
  function setSkill({
    skillId,
    value
  }) {
    requireStarted();

    if (currentView.stage !== "skills") {
      throw new Error(
        "Skills can only be updated during the skills stage."
      );
    }

    const normalisedSkillId =
      requireNonEmptyString(
        skillId,
        "skillId"
      );

    if (!Number.isInteger(value)) {
      throw new TypeError(
        "value must be an integer."
      );
    }

    currentView =
      controller.submit({
        skillId:
          normalisedSkillId,
        value
      });

    return currentView;
  }
  function previous() {
    requireStarted();

    currentView =
      controller.previous();

    return currentView;
  }

  function next() {
    requireStarted();

    currentView =
      controller.next();

    return currentView;
  }

  function finalise() {
    requireStarted();

    currentView =
      controller.finalise({
        startingLocation:
          normalisedStartingLocation,
        startingCredits,
        startingInventory:
          [...startingInventory]
      });

    return currentView;
  }

  function cancel() {
    requireStarted();

    const result = controller.cancel();

    currentView = null;
    ownerId = null;
    platform = null;

    return result;
  }

  function isActive() {
    return (
      currentView !== null &&
      controller.isActive()
    );
  }

  function getIdentity() {
    requireStarted();

    return Object.freeze({
      ownerId,
      platform
    });
  }

  return Object.freeze({
    start,
    getCurrentView,
    submitName,
    setAttribute,
    setSkill,
    previous,
    next,
    finalise,
    cancel,
    isActive,
    getIdentity
  });
}

module.exports = {
  createDiscordCharacterCreationSession
};
