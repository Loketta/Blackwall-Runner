"use strict";

const CHARACTER_CREATION_STAGE = Object.freeze({
  NAME: "name",
  ATTRIBUTES: "attributes",
  SKILLS: "skills",
  PROFESSION: "profession",
  PROFESSION_CHOICES: "profession_choices",
  REVIEW: "review",
  FINISHED: "finished"
});

function normaliseInput(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseKeyValueInput(
  input,
  keyFieldName
) {
  const match = normaliseInput(input).match(
    /^([a-zA-Z][a-zA-Z0-9_-]*)\s+(-?\d+)$/
  );

  if (!match) {
    return null;
  }
return Object.freeze({
    [keyFieldName]: match[1].toLowerCase(),
    value: Number(match[2])
  });
}

function parseAttributeInput(input) {
  return parseKeyValueInput(
    input,
    "attributeId"
  );
}

function parseSkillInput(input) {
  return parseKeyValueInput(
    input,
    "skillId"
  );
}

function parseProfessionInput(
  input,
  options
) {
  const value = normaliseInput(input);

  if (value === "") {
    return null;
  }

  const professionOptions =
    Array.isArray(options)
      ? options
      : [];

  if (/^\d+$/.test(value)) {
    const profession =
      professionOptions[Number(value) - 1];

    if (!profession) {
      return null;
    }
return Object.freeze({
      professionId: profession.id
    });
  }

  const normalisedId =
    value.toLowerCase();

  const profession =
    professionOptions.find(
      (option) =>
        typeof option.id === "string" &&
        option.id.toLowerCase() ===
          normalisedId
    );

  if (!profession) {
    return null;
  }
return Object.freeze({
    professionId: profession.id
  });
}

function parseProfessionChoiceInput(
  input,
  choice
) {
  const value = normaliseInput(input);

  if (
    value === "" ||
    !choice ||
    typeof choice !== "object"
  ) {
    return null;
  }

  const options = Array.isArray(choice.options)
    ? choice.options
    : [];

  let selectedOption = null;

  if (/^\d+$/.test(value)) {
    selectedOption =
      options[Number(value) - 1] ?? null;
  } else {
    const normalisedId =
      value.toLowerCase();

    selectedOption =
      options.find(
        (option) =>
          typeof option.id === "string" &&
          option.id.toLowerCase() ===
            normalisedId
      ) ?? null;
  }

  if (!selectedOption) {
    return null;
  }
return Object.freeze({
    choiceId: choice.id,
    value: selectedOption.id
  });
}

function createCharacterCreationStageHandlers({
  controller,
  readInput,
  writeOutput,
  renderView
}) {
  function showMessage(message) {
    writeOutput(message);
  }

  function showView(view) {
    writeOutput(renderView(view));
  }

  function continueResult() {
return Object.freeze({
      status: "continue"
    });
  }

  function cancelSession() {
    const result = controller.cancel();

    showMessage("");
    showMessage(
      "Character creation closed. Your draft can be resumed later."
    );
return Object.freeze({
      status: "cancelled",
      result
    });
  }

  function tryPrevious(view) {
    if (!view.canMovePrevious) {
      showMessage(
        "You cannot return from this step."
      );

      return;
    }

    try {
      controller.previous();
    } catch (error) {
      showMessage(
        `Unable to go back: ${error.message}`
      );
    }
  }

  function tryNext(
    view,
    blockedMessage
  ) {
    if (!view.canMoveNext) {
      showMessage(blockedMessage);

      return;
    }

    try {
      controller.next();
    } catch (error) {
      showMessage(
        `Unable to continue: ${error.message}`
      );
    }
  }

  async function handleName(view) {
    showView(view);

    const input = normaliseInput(
      await readInput("> ")
    );

    if (input.toLowerCase() === "quit") {
      return cancelSession();
    }

    if (input === "") {
      showMessage(
        "Please enter a character name."
      );

      return continueResult();
    }

    try {
      controller.submit({
        value: input
      });

      controller.next();
    } catch (error) {
      showMessage(
        `Unable to save that name: ${error.message}`
      );
    }

    return continueResult();
  }

  async function handleAttributes(view) {
    showView(view);

    const input = normaliseInput(
      await readInput("> ")
    );

    const command = input.toLowerCase();

    if (command === "quit") {
      return cancelSession();
    }

    if (command === "back") {
      tryPrevious(view);

      return continueResult();
    }

    if (command === "next") {
      tryNext(
        view,
        "All attribute points must be allocated before continuing."
      );

      return continueResult();
    }

    const update = parseAttributeInput(input);

    if (!update) {
      showMessage(
        "Enter an attribute followed by a whole number, for example: force 6"
      );

      return continueResult();
    }

    try {
      controller.submit(update);
    } catch (error) {
      showMessage(
        `Unable to update that attribute: ${error.message}`
      );
    }

    return continueResult();
  }

  async function handleSkills(view) {
    showView(view);

    const input = normaliseInput(
      await readInput("> ")
    );

    const command = input.toLowerCase();

    if (command === "quit") {
      return cancelSession();
    }

    if (command === "back") {
      tryPrevious(view);

      return continueResult();
    }

    if (command === "next") {
      tryNext(
        view,
        "All skill points must be allocated before continuing."
      );

      return continueResult();
    }

    const update = parseSkillInput(input);

    if (!update) {
      showMessage(
        "Enter a skill identifier followed by a whole number, for example: athletics 4"
      );

      return continueResult();
    }

    try {
      controller.submit(update);
    } catch (error) {
      showMessage(
        `Unable to update that skill: ${error.message}`
      );
    }

    return continueResult();
  }

  async function handleProfession(view) {
    showView(view);

    const input = normaliseInput(
      await readInput("> ")
    );

    const command = input.toLowerCase();

    if (command === "quit") {
      return cancelSession();
    }

    if (command === "back") {
      tryPrevious(view);

      return continueResult();
    }

    if (command === "next") {
      tryNext(
        view,
        "A profession must be selected before continuing."
      );

      return continueResult();
    }

    const selection =
      parseProfessionInput(
        input,
        view.options
      );

    if (!selection) {
      showMessage(
        "Choose one of the displayed professions by number or identifier."
      );

      return continueResult();
    }

    try {
      controller.submit(selection);
    } catch (error) {
      showMessage(
        `Unable to select that profession: ${error.message}`
      );
    }

    return continueResult();
  }

  async function handleProfessionChoices(
    view
  ) {
    showView(view);

    const input = normaliseInput(
      await readInput("> ")
    );

    const command = input.toLowerCase();

    if (command === "quit") {
      return cancelSession();
    }

    if (command === "back") {
      tryPrevious(view);

      return continueResult();
    }

    if (command === "next") {
      tryNext(
        view,
        "All required profession choices must be completed before continuing."
      );

      return continueResult();
    }

    const choices = Array.isArray(view.choices)
      ? view.choices
      : [];

    if (choices.length !== 1) {
      showMessage(
        "This profession choice screen cannot currently be completed."
      );

      return continueResult();
    }

    const selection =
      parseProfessionChoiceInput(
        input,
        choices[0]
      );

    if (!selection) {
      showMessage(
        "Choose one of the displayed weapon types by number or identifier."
      );

      return continueResult();
    }

    try {
      controller.submit(selection);
    } catch (error) {
      showMessage(
        `Unable to save that profession choice: ${error.message}`
      );
    }

    return continueResult();
  }

  async function handleReview(view) {
    showView(view);

    const input = normaliseInput(
      await readInput("> ")
    );

    const command = input.toLowerCase();

    if (command === "quit") {
      return cancelSession();
    }

    if (command === "back") {
      tryPrevious(view);

      return continueResult();
    }

    if (command === "finalise") {
      if (
        view.review?.readyToFinalise !== true
      ) {
        showMessage(
          "This character cannot be finalised while validation errors remain."
        );

        return continueResult();
      }

      try {
        controller.finalise();
      } catch (error) {
        showMessage(
          `Unable to create this character: ${error.message}`
        );
      }

      return continueResult();
    }

    showMessage(
      "Type FINALISE to create this character, BACK to revise it, or QUIT to leave."
    );

    return continueResult();
  }
  async function handleFinished(view) {
    showView(view);

    return Object.freeze({
      status: "completed",
      character: view.character ?? null,
      createdCharacter:
        view.createdCharacter === true
    });
  }

return Object.freeze({
    [CHARACTER_CREATION_STAGE.NAME]:
      handleName,
    [CHARACTER_CREATION_STAGE.ATTRIBUTES]:
      handleAttributes,
    [CHARACTER_CREATION_STAGE.SKILLS]:
      handleSkills,
    [CHARACTER_CREATION_STAGE.PROFESSION]:
      handleProfession,
    [CHARACTER_CREATION_STAGE.PROFESSION_CHOICES]:
      handleProfessionChoices,
    [CHARACTER_CREATION_STAGE.REVIEW]:
      handleReview,
    [CHARACTER_CREATION_STAGE.FINISHED]:
      handleFinished
  });
}

module.exports = {
  CHARACTER_CREATION_STAGE,
  createCharacterCreationStageHandlers,
  parseAttributeInput,
  parseProfessionChoiceInput,
  parseProfessionInput,
  parseSkillInput
};