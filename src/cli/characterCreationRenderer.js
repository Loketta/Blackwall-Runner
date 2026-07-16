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

function requireFunction(value, fieldName) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }

  return value;
}

function requireController(controller) {
  if (
    !controller ||
    typeof controller !== "object"
  ) {
    throw new TypeError(
      "controller must be an object."
    );
  }

  const requiredMethods = [
    "start",
    "submit",
    "next",
    "previous",
    "renderCurrentStep",
    "finalise",
    "cancel",
    "isActive"
  ];

  for (const methodName of requiredMethods) {
    if (
      typeof controller[methodName] !==
      "function"
    ) {
      throw new TypeError(
        `controller.${methodName} must be a function.`
      );
    }
  }

  return controller;
}

function normaliseInput(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function formatLabel(identifier) {
  return identifier
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function createHeader(view) {
  return [
    "========================================",
    "BLACKWALL RUNNER",
    "Character Creation",
    "========================================",
    `Step ${view.stageNumber} of ${view.stageCount}`,
    "",
    view.title,
    view.description ?? ""
  ].filter((line, index, lines) => {
    if (line !== "") {
      return true;
    }

    return lines[index - 1] !== "";
  });
}

function createNameScreen(view) {
  const currentName =
    typeof view.values?.name === "string" &&
    view.values.name.trim() !== ""
      ? view.values.name
      : "<not entered>";

  return [
    ...createHeader(view),
    "",
    `Current name: ${currentName}`,
    "",
    "Enter your character's name.",
    "Type QUIT to save your draft and leave."
  ];
}

function createAttributeScreen(view) {
  const lines = [
    ...createHeader(view),
    "",
    "Attributes",
    ""
  ];

  for (
    const [attributeId, value] of
    Object.entries(view.values ?? {})
  ) {
    lines.push(
      `${formatLabel(attributeId).padEnd(20, ".")} ${value}`
    );
  }

  lines.push("");
  lines.push(
    `Allowed range: ${view.rules.minimum}-${view.rules.maximum}`
  );
  lines.push(
    `Total budget: ${view.rules.totalBudget}`
  );
  lines.push(
    `Remaining points: ${view.remainingPoints}`
  );
  lines.push("");
  lines.push(
    "Enter an attribute and value, for example:"
  );
  lines.push("body 6");

  if (view.canMoveNext) {
    lines.push("");
    lines.push(
      "All points are allocated. Type NEXT to continue."
    );
  }

  if (view.canMovePrevious) {
    lines.push(
      "Type BACK to return to the previous step."
    );
  }

  lines.push(
    "Type QUIT to save your draft and leave."
  );

  return lines;
}

function getOrderedSkillEntries(view) {
  const values = view.values ?? {};
  const options = Array.isArray(view.options)
    ? view.options
    : [];

  if (options.length === 0) {
    return Object.entries(values).map(
      ([skillId, value]) => ({
        id: skillId,
        name: formatLabel(skillId),
        value
      })
    );
  }

  return options.map((skill) => ({
    id: skill.id,
    name:
      typeof skill.name === "string" &&
      skill.name.trim() !== ""
        ? skill.name
        : formatLabel(skill.id),
    value: values[skill.id] ?? 0
  }));
}

function createSkillScreen(view) {
  const lines = [
    ...createHeader(view),
    "",
    "Skills",
    ""
  ];

  for (
    const skill of
    getOrderedSkillEntries(view)
  ) {
    lines.push(
      `${skill.name.padEnd(28, ".")} ${skill.value}`
    );
  }

  lines.push("");
  lines.push(
    `Allowed range: ${view.rules.minimum}-${view.rules.maximum}`
  );
  lines.push(
    `Total budget: ${view.rules.totalBudget}`
  );
  lines.push(
    `Remaining points: ${view.remainingPoints}`
  );
  lines.push("");
  lines.push(
    "Enter a skill identifier and value."
  );
  lines.push(
    "Example: athletics 4"
  );

  if (view.canMoveNext) {
    lines.push("");
    lines.push(
      "All points are allocated. Type NEXT to continue."
    );
  }

  if (view.canMovePrevious) {
    lines.push(
      "Type BACK to return to the previous step."
    );
  }

  lines.push(
    "Type QUIT to save your draft and leave."
  );

  return lines;
}

function createUnsupportedScreen(view) {
  return [
    ...createHeader(view),
    "",
    "This guided step has not yet been added.",
    "Your draft has been preserved."
  ];
}

function renderView(view) {
  if (
    !view ||
    typeof view !== "object"
  ) {
    throw new TypeError(
      "view must be an object."
    );
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.NAME
  ) {
    return createNameScreen(view).join("\n");
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.ATTRIBUTES
  ) {
    return createAttributeScreen(view).join(
      "\n"
    );
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.SKILLS
  ) {
    return createSkillScreen(view).join(
      "\n"
    );
  }

  return createUnsupportedScreen(view).join(
    "\n"
  );
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

function createCharacterCreationRenderer({
  controller,
  readInput,
  writeOutput
}) {
  const characterCreationController =
    requireController(controller);

  const read = requireFunction(
    readInput,
    "readInput"
  );

  const write = requireFunction(
    writeOutput,
    "writeOutput"
  );

  function showMessage(message) {
    write(message);
  }

  function showView(view) {
    write(renderView(view));
  }

  function cancelSession() {
    const result =
      characterCreationController.cancel();

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
      characterCreationController.previous();
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
      characterCreationController.next();
    } catch (error) {
      showMessage(
        `Unable to continue: ${error.message}`
      );
    }
  }

  async function handleName(view) {
    showView(view);

    const input = normaliseInput(
      await read("> ")
    );

    if (input.toLowerCase() === "quit") {
      return cancelSession();
    }

    if (input === "") {
      showMessage(
        "Please enter a character name."
      );

      return Object.freeze({
        status: "continue"
      });
    }

    try {
      characterCreationController.submit({
        value: input
      });

      characterCreationController.next();
    } catch (error) {
      showMessage(
        `Unable to save that name: ${error.message}`
      );
    }

    return Object.freeze({
      status: "continue"
    });
  }

  async function handleAttributes(view) {
    showView(view);

    const input = normaliseInput(
      await read("> ")
    );

    const command = input.toLowerCase();

    if (command === "quit") {
      return cancelSession();
    }

    if (command === "back") {
      tryPrevious(view);

      return Object.freeze({
        status: "continue"
      });
    }

    if (command === "next") {
      tryNext(
        view,
        "All attribute points must be allocated before continuing."
      );

      return Object.freeze({
        status: "continue"
      });
    }

    const update = parseAttributeInput(input);

    if (!update) {
      showMessage(
        "Enter an attribute followed by a whole number, for example: body 6"
      );

      return Object.freeze({
        status: "continue"
      });
    }

    try {
      characterCreationController.submit(
        update
      );
    } catch (error) {
      showMessage(
        `Unable to update that attribute: ${error.message}`
      );
    }

    return Object.freeze({
      status: "continue"
    });
  }

  async function handleSkills(view) {
    showView(view);

    const input = normaliseInput(
      await read("> ")
    );

    const command = input.toLowerCase();

    if (command === "quit") {
      return cancelSession();
    }

    if (command === "back") {
      tryPrevious(view);

      return Object.freeze({
        status: "continue"
      });
    }

    if (command === "next") {
      tryNext(
        view,
        "All skill points must be allocated before continuing."
      );

      return Object.freeze({
        status: "continue"
      });
    }

    const update = parseSkillInput(input);

    if (!update) {
      showMessage(
        "Enter a skill identifier followed by a whole number, for example: athletics 4"
      );

      return Object.freeze({
        status: "continue"
      });
    }

    try {
      characterCreationController.submit(
        update
      );
    } catch (error) {
      showMessage(
        `Unable to update that skill: ${error.message}`
      );
    }

    return Object.freeze({
      status: "continue"
    });
  }

  async function run({
    ownerId,
    platform
  }) {
    let view =
      characterCreationController.start({
        ownerId,
        platform
      });

    while (
      characterCreationController.isActive()
    ) {
      let result;

      if (
        view.stage ===
        CHARACTER_CREATION_STAGE.NAME
      ) {
        result = await handleName(view);
      } else if (
        view.stage ===
        CHARACTER_CREATION_STAGE.ATTRIBUTES
      ) {
        result = await handleAttributes(view);
      } else if (
        view.stage ===
        CHARACTER_CREATION_STAGE.SKILLS
      ) {
        result = await handleSkills(view);
      } else {
        showView(view);

        return Object.freeze({
          status: "stage_not_implemented",
          stage: view.stage
        });
      }

      if (result.status === "cancelled") {
        return result;
      }

      if (
        !characterCreationController.isActive()
      ) {
        break;
      }

      view =
        characterCreationController.renderCurrentStep();
    }

    return Object.freeze({
      status: "closed"
    });
  }

  return Object.freeze({
    run,
    renderView
  });
}

module.exports = {
  CHARACTER_CREATION_STAGE,
  createCharacterCreationRenderer,
  formatLabel,
  parseAttributeInput,
  parseSkillInput,
  renderView
};