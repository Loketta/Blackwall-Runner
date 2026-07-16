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

function formatLabel(identifier) {
  if (typeof identifier !== "string") {
    return "";
  }

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
  lines.push("force 6");

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

function getDisplayName(value) {
  if (typeof value === "string") {
    return formatLabel(value);
  }

  if (
    value &&
    typeof value === "object"
  ) {
    if (
      typeof value.name === "string" &&
      value.name.trim() !== ""
    ) {
      return value.name;
    }

    if (
      typeof value.title === "string" &&
      value.title.trim() !== ""
    ) {
      return value.title;
    }

    if (
      typeof value.id === "string"
    ) {
      return formatLabel(value.id);
    }
  }

  return "";
}

function createProfessionScreen(view) {
  const lines = [
    ...createHeader(view),
    "",
    "Professions",
    ""
  ];

  const options = Array.isArray(view.options)
    ? view.options
    : [];

  options.forEach((profession, index) => {
    const selected =
      view.values?.professionId ===
      profession.id;

    lines.push(
      `${index + 1}. ${profession.name}` +
      `${selected ? " [selected]" : ""}`
    );

    lines.push(
      `   Identifier: ${profession.id}`
    );

    if (
      Array.isArray(profession.aptitudes) &&
      profession.aptitudes.length > 0
    ) {
      const aptitudeNames =
        profession.aptitudes
          .map(getDisplayName)
          .filter(Boolean);

      if (aptitudeNames.length > 0) {
        lines.push(
          `   Aptitudes: ${aptitudeNames.join(", ")}`
        );
      }
    }

    const masteryName =
      getDisplayName(profession.mastery);

    if (masteryName !== "") {
      lines.push(
        `   Mastery: ${masteryName}`
      );
    }

    if (
      profession.mastery &&
      typeof profession.mastery === "object" &&
      typeof profession.mastery.description ===
        "string" &&
      profession.mastery.description.trim() !== ""
    ) {
      lines.push(
        `   ${profession.mastery.description}`
      );
    }

    lines.push("");
  });

  lines.push(
    "Choose a profession by number or identifier."
  );
  lines.push(
    "Example: 2"
  );

  if (view.canMoveNext) {
    lines.push("");
    lines.push(
      "A profession is selected. Type NEXT to continue."
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

function createProfessionChoiceScreen(view) {
  const lines = [
    ...createHeader(view),
    "",
    "Profession Choices",
    ""
  ];

  const choices = Array.isArray(view.choices)
    ? view.choices
    : [];

  for (const choice of choices) {
    lines.push(
      `${formatLabel(choice.id)}${choice.required ? " [required]" : ""}`
    );

    const currentValue =
      typeof choice.value === "string" &&
      choice.value.trim() !== ""
        ? choice.value
        : null;

    lines.push(
      `Current selection: ${currentValue
        ? formatLabel(currentValue)
        : "<not selected>"}`
    );

    lines.push("");

    const options = Array.isArray(choice.options)
      ? choice.options
      : [];

    options.forEach((option, index) => {
      const selected =
        currentValue === option.id;

      lines.push(
        `${index + 1}. ${option.name}${selected ? " [selected]" : ""}`
      );

      lines.push(
        `   Identifier: ${option.id}`
      );

      if (
        typeof option.category === "string" &&
        option.category.trim() !== ""
      ) {
        lines.push(
          `   Category: ${formatLabel(option.category)}`
        );
      }
    });

    lines.push("");
  }

  lines.push(
    "Choose a weapon type by number or identifier."
  );
  lines.push("Example: 1");

  if (view.canMoveNext) {
    lines.push("");
    lines.push(
      "All required choices are complete. Type NEXT to continue."
    );
  }

  if (view.canMovePrevious) {
    lines.push(
      "Type BACK to return to profession selection."
    );
  }

  lines.push(
    "Type QUIT to save your draft and leave."
  );

  return lines;
}

function getValidationMessage(error) {
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unknown validation error.";
}

function createReviewScreen(view) {
  const review = view.review ?? {};

  const lines = [
    ...createHeader(view),
    "",
    "Character Summary",
    ""
  ];

  const characterName =
    typeof review.identity?.name === "string" &&
    review.identity.name.trim() !== ""
      ? review.identity.name
      : "<not entered>";

  lines.push(`Name: ${characterName}`);

  const professionName =
    typeof review.profession?.name === "string" &&
    review.profession.name.trim() !== ""
      ? review.profession.name
      : "<not selected>";

  lines.push(`Profession: ${professionName}`);

  const masteryName =
    getDisplayName(
      review.profession?.mastery
    );

  if (masteryName !== "") {
    lines.push(`Mastery: ${masteryName}`);
  }

  const professionChoices =
    review.professionChoices ?? {};

  for (
    const [choiceId, value] of
    Object.entries(professionChoices)
  ) {
    lines.push(
      `${formatLabel(choiceId)}: ${formatLabel(value)}`
    );
  }

  lines.push("");
  lines.push("Attributes");
  lines.push("----------------------------------------");

  for (
    const [attributeId, value] of
    Object.entries(review.attributes ?? {})
  ) {
    lines.push(
      `${formatLabel(attributeId).padEnd(20, ".")} ${value}`
    );
  }

  lines.push("");
  lines.push("Trained and Modified Skills");
  lines.push("----------------------------------------");

  const effectiveSkills =
    Object.values(
      review.effectiveSkills ?? {}
    ).filter((skill) => {
      if (
        !skill ||
        typeof skill !== "object"
      ) {
        return false;
      }

      return (
        skill.baseRank > 0 ||
        skill.professionBonus !== 0 ||
        skill.equipmentBonus !== 0 ||
        skill.temporaryModifiers !== 0
      );
    });

  if (effectiveSkills.length === 0) {
    lines.push("No trained or modified skills.");
  }

  for (const skill of effectiveSkills) {
    const skillName =
      typeof skill.name === "string" &&
      skill.name.trim() !== ""
        ? skill.name
        : formatLabel(skill.id);

    const modifiers = [];

    if (skill.professionBonus !== 0) {
      modifiers.push(
        `profession ${skill.professionBonus >= 0 ? "+" : ""}${skill.professionBonus}`
      );
    }

    if (skill.equipmentBonus !== 0) {
      modifiers.push(
        `equipment ${skill.equipmentBonus >= 0 ? "+" : ""}${skill.equipmentBonus}`
      );
    }

    if (skill.temporaryModifiers !== 0) {
      modifiers.push(
        `temporary ${skill.temporaryModifiers >= 0 ? "+" : ""}${skill.temporaryModifiers}`
      );
    }

    const modifierText =
      modifiers.length > 0
        ? ` (${modifiers.join(", ")})`
        : "";

    lines.push(
      `${skillName.padEnd(28, ".")} ` +
      `${skill.effectiveRank}${modifierText}`
    );
  }

  if (
    typeof review.contextualSkillNote ===
      "string" &&
    review.contextualSkillNote.trim() !== ""
  ) {
    lines.push("");
    lines.push(review.contextualSkillNote);
  }

  lines.push("");
  lines.push("Validation");
  lines.push("----------------------------------------");

  const validationErrors =
    Array.isArray(review.validation?.errors)
      ? review.validation.errors
      : [];

  if (
    review.validation?.valid === true &&
    validationErrors.length === 0
  ) {
    lines.push(
      "Character creation is complete and valid."
    );
  } else {
    lines.push(
      "The following issues must be corrected:"
    );

    if (validationErrors.length === 0) {
      lines.push(
        "- Character validation did not succeed."
      );
    }

    for (const error of validationErrors) {
      lines.push(
        `- ${getValidationMessage(error)}`
      );
    }
  }

  lines.push("");

  if (review.readyToFinalise === true) {
    lines.push(
      "Type FINALISE to create this character."
    );
  } else {
    lines.push(
      "This character cannot be finalised yet."
    );
  }

  if (view.canMovePrevious) {
    lines.push(
      "Type BACK to revise your character."
    );
  }

  lines.push(
    "Type QUIT to save your draft and leave."
  );

  return lines;
}

function createFinishedScreen(view) {
  const character = view.character ?? {};

  const characterName =
    typeof character.name === "string" &&
    character.name.trim() !== ""
      ? character.name
      : "Your character";

  const resultMessage =
    view.createdCharacter === true
      ? `${characterName} has been created successfully.`
      : `${characterName} was already created.`;

  return [
    ...createHeader(view),
    "",
    resultMessage,
    "",
    `Character ID: ${character.id ?? "<unknown>"}`,
    `World: ${character.worldId ?? "<unknown>"}`,
    "",
    "Character creation is complete."
  ];
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

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.PROFESSION
  ) {
    return createProfessionScreen(view).join(
      "\n"
    );
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.PROFESSION_CHOICES
  ) {
    return createProfessionChoiceScreen(
      view
    ).join("\n");
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.REVIEW
  ) {
    return createReviewScreen(view).join(
      "\n"
    );
  }
  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.FINISHED
  ) {
    return createFinishedScreen(view).join(
      "\n"
    );
  }

  return createUnsupportedScreen(view).join(
    "\n"
  );
}

module.exports = {
  formatLabel,
  renderView
};