"use strict";

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
} = require("discord.js");

const CHARACTER_CREATION_STAGE = Object.freeze({
  NAME: "name",
  ATTRIBUTES: "attributes",
  SKILLS: "skills",
  PROFESSION: "profession",
  PROFESSION_CHOICES: "profession_choices",
  REVIEW: "review",
  FINISHED: "finished"
});

const DISCORD_CHARACTER_CREATION_ACTION =
  Object.freeze({
    SET_NAME:
      "character_creation:set_name",
    SUBMIT_NAME:
      "character_creation:submit_name",
    PREVIOUS:
      "character_creation:previous",
    NEXT:
      "character_creation:next",
    SELECT_PROFESSION:
      "character_creation:profession",
    CANCEL:
      "character_creation:cancel"
  });
const SKILLS_PER_PAGE = 8;

const SKILL_PAGE_ACTION_PREFIX =
  "character_creation:skills_page:";



const PROFESSION_CHOICE_ACTION_PREFIX =
  "character_creation:profession_choice:";
function requireView(view) {
  if (
    !view ||
    typeof view !== "object"
  ) {
    throw new TypeError(
      "view must be an object."
    );
  }

  if (
    typeof view.stage !== "string" ||
    view.stage.trim() === ""
  ) {
    throw new TypeError(
      "view.stage must be a non-empty string."
    );
  }

  return view;
}

function getCurrentName(view) {
  const name = view.values?.name;

  if (
    typeof name !== "string" ||
    name.trim() === ""
  ) {
    return "Not entered";
  }

  return name.trim();
}

function createBaseEmbed(view) {
  const stageNumber =
    Number.isInteger(view.stageNumber)
      ? view.stageNumber
      : "?";

  const stageCount =
    Number.isInteger(view.stageCount)
      ? view.stageCount
      : "?";

  const title =
    typeof view.title === "string" &&
    view.title.trim() !== ""
      ? view.title.trim()
      : "Character Creation";

  const description =
    typeof view.description === "string"
      ? view.description.trim()
      : "";

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setFooter({
      text:
        `Blackwall Runner • Step ` +
        `${stageNumber} of ${stageCount}`
    });

  if (description !== "") {
    embed.setDescription(description);
  }

  return embed;
}

function createNameComponents() {
  const setNameButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.SET_NAME
      )
      .setLabel("Set Name")
      .setStyle(ButtonStyle.Primary);

  const cancelButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.CANCEL
      )
      .setLabel("Save and Exit")
      .setStyle(ButtonStyle.Secondary);

  return [
    new ActionRowBuilder()
      .addComponents(
        setNameButton,
        cancelButton
      )
      .toJSON()
  ];
}

function createNamePayload(view) {
  const descriptionLines = [];

  if (
    typeof view.description === "string" &&
    view.description.trim() !== ""
  ) {
    descriptionLines.push(
      view.description.trim()
    );
  }

  descriptionLines.push(
    "Use **Set Name** to enter the name your character will use."
  );

  const embed = createBaseEmbed(view)
    .setDescription(
      descriptionLines.join("\n\n")
    )
    .addFields({
      name: "Current name",
      value: getCurrentName(view),
      inline: false
    });

  return Object.freeze({
    embeds: [
      embed.toJSON()
    ],
    components:
      createNameComponents()
  });
}

function formatAttributeName(attributeId) {
  return attributeId
    .split("_")
    .map((part) =>
      part.length > 0
        ? part[0].toUpperCase() +
          part.slice(1)
        : part
    )
    .join(" ");
}

function createAttributeAdjustmentButtons(
  view
) {
  const values =
    view.values &&
    typeof view.values === "object"
      ? view.values
      : {};

  const rules =
    view.rules &&
    typeof view.rules === "object"
      ? view.rules
      : {};

  const minimum =
    Number.isInteger(rules.minimum)
      ? rules.minimum
      : 2;

  const maximum =
    Number.isInteger(rules.maximum)
      ? rules.maximum
      : 8;

  const remainingPoints =
    Number.isInteger(view.remainingPoints)
      ? view.remainingPoints
      : 0;

  return Object.entries(values)
    .flatMap(
      ([attributeId, value]) => {
        const displayName =
          formatAttributeName(
            attributeId
          );

        const decreaseButton =
          new ButtonBuilder()
            .setCustomId(
              `character_creation:attribute:${attributeId}:decrease`
            )
            .setLabel(`- ${displayName}`)
            .setStyle(
              ButtonStyle.Secondary
            )
            .setDisabled(
              !Number.isInteger(value) ||
              value <= minimum
            );

        const increaseButton =
          new ButtonBuilder()
            .setCustomId(
              `character_creation:attribute:${attributeId}:increase`
            )
            .setLabel(`+ ${displayName}`)
            .setStyle(
              ButtonStyle.Primary
            )
            .setDisabled(
              !Number.isInteger(value) ||
              value >= maximum ||
              remainingPoints <= 0
            );

        return [
          decreaseButton,
          increaseButton
        ];
      }
    );
}

function createComponentRows(
  components,
  maximumPerRow = 5
) {
  const rows = [];

  for (
    let index = 0;
    index < components.length;
    index += maximumPerRow
  ) {
    rows.push(
      new ActionRowBuilder()
        .addComponents(
          ...components.slice(
            index,
            index + maximumPerRow
          )
        )
        .toJSON()
    );
  }

  return rows;
}

function createStageNavigationRow(view) {
  const previousButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.PREVIOUS
      )
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(
        view.canMovePrevious !== true
      );

  const nextButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.NEXT
      )
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(
        view.canMoveNext !== true
      );

  const cancelButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.CANCEL
      )
      .setLabel("Save and Exit")
      .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder()
    .addComponents(
      previousButton,
      nextButton,
      cancelButton
    )
    .toJSON();
}

function createAttributesComponents(view) {
  const adjustmentButtons =
    createAttributeAdjustmentButtons(
      view
    );

  const adjustmentRows =
    createComponentRows(
      adjustmentButtons
    );

  return [
    ...adjustmentRows,
    createStageNavigationRow(view)
  ];
}

function createAttributesPayload(view) {
  const values =
    view.values &&
    typeof view.values === "object"
      ? view.values
      : {};

  const rules =
    view.rules &&
    typeof view.rules === "object"
      ? view.rules
      : {};

  const attributeLines =
    Object.entries(values)
      .map(([attributeId, value]) =>
        `**${formatAttributeName(attributeId)}:** ${value}`
      );

  const allocationLines = [
    `**Allocated:** ${view.allocatedPoints ?? "?"} / ${rules.totalBudget ?? "?"}`,
    `**Remaining:** ${view.remainingPoints ?? "?"}`,
    `**Minimum:** ${rules.minimum ?? "?"}`,
    `**Maximum:** ${rules.maximum ?? "?"}`
  ];

  const embed = createBaseEmbed(view)
    .addFields(
      {
        name: "Allocation",
        value: allocationLines.join("\n"),
        inline: false
      },
      {
        name: "Current Attributes",
        value:
          attributeLines.length > 0
            ? attributeLines.join("\n")
            : "No attribute values available.",
        inline: false
      }
    );

  return Object.freeze({
    embeds: [
      embed.toJSON()
    ],
    components:
      createAttributesComponents(view)  });
}
function getSkillDisplayName(
  skillId,
  options
) {
  const matchingOption =
    Array.isArray(options)
      ? options.find(
          (option) =>
            option &&
            option.id === skillId
        )
      : null;

  if (
    matchingOption &&
    typeof matchingOption.name === "string" &&
    matchingOption.name.trim() !== ""
  ) {
    return matchingOption.name.trim();
  }

  return formatAttributeName(skillId);
}

function chunkLines(
  lines,
  maximumLines
) {
  const chunks = [];

  for (
    let index = 0;
    index < lines.length;
    index += maximumLines
  ) {
    chunks.push(
      lines.slice(
        index,
        index + maximumLines
      )
    );
  }

  return chunks;
}
function getSkillsPage(
  view,
  options = {}
) {
  const values =
    view.values &&
    typeof view.values === "object"
      ? view.values
      : {};

  const entries =
    Object.entries(values);

  const pageCount =
    Math.max(
      1,
      Math.ceil(
        entries.length /
        SKILLS_PER_PAGE
      )
    );

  const requestedPage =
    Number.isInteger(
      options.skillPage
    )
      ? options.skillPage
      : 0;

  const page =
    Math.min(
      Math.max(
        requestedPage,
        0
      ),
      pageCount - 1
    );

  const firstIndex =
    page * SKILLS_PER_PAGE;

  return Object.freeze({
    page,
    pageCount,
    entries:
      entries.slice(
        firstIndex,
        firstIndex +
          SKILLS_PER_PAGE
      )
  });
}

function createSkillAdjustmentButtons(
  view,
  options = {}
) {
  const rules =
    view.rules &&
    typeof view.rules === "object"
      ? view.rules
      : {};

  const skillOptions =
    Array.isArray(view.options)
      ? view.options
      : [];

  const minimum =
    Number.isInteger(
      rules.minimum
    )
      ? rules.minimum
      : 0;

  const maximum =
    Number.isInteger(
      rules.maximum
    )
      ? rules.maximum
      : 4;

  const remainingPoints =
    Number.isInteger(
      view.remainingPoints
    )
      ? view.remainingPoints
      : 0;

  const page =
    getSkillsPage(
    view,
    options
  );

  return page.entries.flatMap(
    ([skillId, value]) => {
      const displayName =
        getSkillDisplayName(
          skillId,
          skillOptions
        );

      const decreaseButton =
        new ButtonBuilder()
          .setCustomId(
            `character_creation:skill:${skillId}:decrease:${page.page}`
          )
          .setLabel(
            `- ${displayName}`
          )
          .setStyle(
            ButtonStyle.Secondary
          )
          .setDisabled(
            !Number.isInteger(value) ||
            value <= minimum
          );

      const increaseButton =
        new ButtonBuilder()
          .setCustomId(
            `character_creation:skill:${skillId}:increase:${page.page}`
          )
          .setLabel(
            `+ ${displayName}`
          )
          .setStyle(
            ButtonStyle.Primary
          )
          .setDisabled(
            !Number.isInteger(value) ||
            value >= maximum ||
            remainingPoints <= 0
          );

      return [
        decreaseButton,
        increaseButton
      ];
    }
  );
}

function createSkillsComponents(
  view,
  options = {}
) {
  const page =
    getSkillsPage(
    view,
    options
  );

  const adjustmentRows =
    createComponentRows(
      createSkillAdjustmentButtons(
        view,
        options
      )
    );

  if (
    adjustmentRows.length > 4
  ) {
    throw new Error(
      "Skills page exceeds the Discord component row limit"
    );
  }

  const previousPageButton =
    new ButtonBuilder()
      .setCustomId(
        `${SKILL_PAGE_ACTION_PREFIX}${
          Math.max(
            page.page - 1,
            0
          )
        }`
      )
      .setLabel(
        "Skills Back"
      )
      .setStyle(
        ButtonStyle.Secondary
      )
      .setDisabled(
        page.page <= 0
      );

  const nextPageButton =
    new ButtonBuilder()
      .setCustomId(
        `${SKILL_PAGE_ACTION_PREFIX}${
          Math.min(
            page.page + 1,
            page.pageCount - 1
          )
        }`
      )
      .setLabel(
        "Skills Next"
      )
      .setStyle(
        ButtonStyle.Secondary
      )
      .setDisabled(
        page.page >=
          page.pageCount - 1
      );

  const previousStageButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.PREVIOUS
      )
      .setLabel(
        "Previous"
      )
      .setStyle(
        ButtonStyle.Secondary
      )
      .setDisabled(
        view.canMovePrevious !== true
      );

  const nextStageButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.NEXT
      )
      .setLabel(
        "Next"
      )
      .setStyle(
        ButtonStyle.Primary
      )
      .setDisabled(
        view.canMoveNext !== true
      );

  const cancelButton =
    new ButtonBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION.CANCEL
      )
      .setLabel(
        "Save and Exit"
      )
      .setStyle(
        ButtonStyle.Secondary
      );

  const navigationRow =
    new ActionRowBuilder()
      .addComponents(
        previousPageButton,
        nextPageButton,
        previousStageButton,
        nextStageButton,
        cancelButton
      )
      .toJSON();

  return [
    ...adjustmentRows,
    navigationRow
  ];
}
function createSkillsPayload(
  view,
  options = {}
) {
  const values =
    view.values &&
    typeof view.values === "object"
      ? view.values
      : {};

  const rules =
    view.rules &&
    typeof view.rules === "object"
      ? view.rules
      : {};

  const skillOptions =
    Array.isArray(view.options)
      ? view.options
      : [];

  const allocationLines = [
    `**Allocated:** ${view.allocatedPoints ?? "?"} / ${rules.totalBudget ?? "?"}`,
    `**Remaining:** ${view.remainingPoints ?? "?"}`,
    `**Minimum:** ${rules.minimum ?? "?"}`,
    `**Maximum:** ${rules.maximum ?? "?"}`
  ];

  if (
    typeof rules.untrainedAllowed === "boolean"
  ) {
    allocationLines.push(
      `**Untrained Allowed:** ${
        rules.untrainedAllowed
          ? "Yes"
          : "No"
      }`
    );
  }

  if (
    typeof rules.untrainedRollMode === "string" &&
    rules.untrainedRollMode.trim() !== ""
  ) {
    allocationLines.push(
      `**Untrained Roll:** ${
        formatAttributeName(
          rules.untrainedRollMode
        )
      }`
    );
  }

  const skillLines =
    Object.entries(values)
      .map(([skillId, value]) =>
        `**${getSkillDisplayName(
          skillId,
          skillOptions
        )}:** ${value}`
      );

  const embed = createBaseEmbed(view)
    .addFields({
      name: "Allocation",
      value: allocationLines.join("\n"),
      inline: false
    });

  if (skillLines.length === 0) {
    embed.addFields({
      name: "Current Skills",
      value: "No skill values available.",
      inline: false
    });
  } else {
    const skillChunks =
      chunkLines(skillLines, 11);

    skillChunks.forEach(
      (chunk, index) => {
        embed.addFields({
          name:
            index === 0
              ? "Current Skills"
              : `Current Skills ${
                  index + 1
                }`,
          value: chunk.join("\n"),
          inline: true
        });
      }
    );
  }

  return Object.freeze({
    embeds: [
      embed.toJSON()
    ],
    components:
      createSkillsComponents(
      view,
      options
    )
  });
}
function formatDisplayValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "Not specified";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed !== ""
      ? trimmed
      : "Not specified";
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "None";
    }

    return value
      .map((entry) =>
        formatDisplayValue(entry)
      )
      .join(", ");
  }

  if (typeof value === "object") {
    const preferredParts = [];

    if (
      typeof value.name === "string" &&
      value.name.trim() !== ""
    ) {
      preferredParts.push(
        value.name.trim()
      );
    }

    if (
      typeof value.description === "string" &&
      value.description.trim() !== ""
    ) {
      preferredParts.push(
        value.description.trim()
      );
    }

    if (
      typeof value.effect === "string" &&
      value.effect.trim() !== ""
    ) {
      preferredParts.push(
        value.effect.trim()
      );
    }

    if (preferredParts.length > 0) {
      return preferredParts.join(" — ");
    }

    return Object.entries(value)
      .map(([key, entry]) =>
        `${formatAttributeName(key)}: ${
          formatDisplayValue(entry)
        }`
      )
      .join("; ");
  }

  return String(value);
}

function truncateDiscordFieldValue(value) {
  const text =
    typeof value === "string"
      ? value
      : String(value);

  if (text.length <= 1024) {
    return text;
  }

  return `${text.slice(0, 1021)}...`;
}

function getSelectedProfessionName(
  professionId,
  options
) {
  if (
    typeof professionId !== "string" ||
    professionId.trim() === ""
  ) {
    return "Not selected";
  }

  const matchingOption =
    Array.isArray(options)
      ? options.find(
          (option) =>
            option &&
            option.id === professionId
        )
      : null;

  if (
    matchingOption &&
    typeof matchingOption.name === "string" &&
    matchingOption.name.trim() !== ""
  ) {
    return matchingOption.name.trim();
  }

  return formatAttributeName(
    professionId
  );
}

function createProfessionOptionText(option) {
  const lines = [];

  if (
    option &&
    option.aptitudes !== undefined
  ) {
    lines.push(
      `**Aptitudes:** ${
        formatDisplayValue(
          option.aptitudes
        )
      }`
    );
  }

  if (
    option &&
    option.mastery !== undefined
  ) {
    lines.push(
      `**Mastery:** ${
        formatDisplayValue(
          option.mastery
        )
      }`
    );
  }

  if (
    option &&
    typeof option.status === "string" &&
    option.status.trim() !== ""
  ) {
    lines.push(
      `**Status:** ${option.status.trim()}`
    );
  }

  if (lines.length === 0) {
    lines.push(
      "No profession details available."
    );
  }

  return truncateDiscordFieldValue(
    lines.join("\n")
  );
}

function createProfessionComponents(
  view
) {
  const options =
    Array.isArray(view.options)
      ? view.options
      : [];

  const professionId =
    typeof view.values?.professionId ===
    "string"
      ? view.values.professionId
      : null;
  if (options.length === 0) {
    return [];
  }

  const professionMenu =
    new StringSelectMenuBuilder()
      .setCustomId(
        DISCORD_CHARACTER_CREATION_ACTION
          .SELECT_PROFESSION
      )
      .setPlaceholder(
        "Choose a profession"
      )
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        options.map(
          (option, index) => {
            const optionId =
              option &&
              typeof option.id === "string" &&
              option.id.trim() !== ""
                ? option.id.trim()
                : `profession_${index + 1}`;

            const optionName =
              option &&
              typeof option.name === "string" &&
              option.name.trim() !== ""
                ? option.name.trim()
                : formatAttributeName(
                    optionId
                  );

            return {
              label:
                optionName.slice(0, 100),
              value:
                optionId.slice(0, 100),
              default:
                optionId === professionId
            };
          }
        )
      );

  return [
    new ActionRowBuilder()
      .addComponents(
        professionMenu
      )
      .toJSON()
  ];
}
function createProfessionPayload(view) {
  const options =
    Array.isArray(view.options)
      ? view.options
      : [];

  const professionId =
    typeof view.values?.professionId ===
    "string"
      ? view.values.professionId
      : null;

  const embed = createBaseEmbed(view)
    .addFields({
      name: "Current Profession",
      value:
        getSelectedProfessionName(
          professionId,
          options
        ),
      inline: false
    });

  if (options.length === 0) {
    embed.addFields({
      name: "Available Professions",
      value:
        "No profession options available.",
      inline: false
    });
  } else {
    options.forEach((option, index) => {
      const optionName =
        option &&
        typeof option.name === "string" &&
        option.name.trim() !== ""
          ? option.name.trim()
          : option &&
              typeof option.id === "string"
            ? formatAttributeName(
                option.id
              )
            : `Profession ${index + 1}`;

      const selected =
        option &&
        option.id === professionId;

      embed.addFields({
        name:
          selected
            ? `${optionName} — Selected`
            : optionName,
        value:
          createProfessionOptionText(
            option
          ),
        inline: false
      });
    });
  }

  return Object.freeze({
    embeds: [
      embed.toJSON()
    ],
    components:
      createProfessionComponents(
        view
      )
  });
}
function createProfessionChoiceComponents(
  choices
) {
  const selectableChoices =
    choices.filter(
      (choice) =>
        choice &&
        typeof choice.id === "string" &&
        choice.id.trim() !== "" &&
        Array.isArray(choice.options) &&
        choice.options.length > 0
    );

  if (selectableChoices.length === 0) {
    return [];
  }

  if (selectableChoices.length > 5) {
    throw new Error(
      "Profession choices exceed the Discord component row limit."
    );
  }

  return selectableChoices.map(
    (choice, choiceIndex) => {
      const choiceId =
        choice.id.trim();

      const minimumSelections =
        Number.isInteger(
          choice.minimumSelections
        )
          ? Math.max(
              0,
              choice.minimumSelections
            )
          : choice.required === true
            ? 1
            : 0;

      const maximumSelections =
        Number.isInteger(
          choice.maximumSelections
        )
          ? Math.max(
              1,
              choice.maximumSelections
            )
          : 1;

      const boundedMaximumSelections =
        Math.min(
          maximumSelections,
          choice.options.length,
          25
        );

      const boundedMinimumSelections =
        Math.min(
          minimumSelections,
          boundedMaximumSelections
        );

      const currentValues =
        Array.isArray(choice.value)
          ? choice.value.filter(
              (value) =>
                typeof value === "string"
            )
          : typeof choice.value === "string"
            ? [choice.value]
            : [];

      const menu =
        new StringSelectMenuBuilder()
          .setCustomId(
            `${PROFESSION_CHOICE_ACTION_PREFIX}${choiceId}`
          )
          .setPlaceholder(
            `Choose ${formatAttributeName(
              choiceId
            )}`.slice(0, 150)
          )
          .setMinValues(
            boundedMinimumSelections
          )
          .setMaxValues(
            boundedMaximumSelections
          )
          .addOptions(
            choice.options
              .slice(0, 25)
              .map(
                (option, optionIndex) => {
                  const optionId =
                    option &&
                    typeof option.id ===
                      "string" &&
                    option.id.trim() !== ""
                      ? option.id.trim()
                      : `option_${
                          optionIndex + 1
                        }`;

                  const optionName =
                    option &&
                    typeof option.name ===
                      "string" &&
                    option.name.trim() !== ""
                      ? option.name.trim()
                      : formatAttributeName(
                          optionId
                        );

                  const description =
                    option &&
                    typeof option.category ===
                      "string" &&
                    option.category.trim() !== ""
                      ? formatAttributeName(
                          option.category
                        ).slice(0, 100)
                      : null;

                  return {
                    label:
                      optionName.slice(0, 100),
                    value:
                      optionId.slice(0, 100),
                    default:
                      currentValues.includes(
                        optionId
                      ),
                    ...(description
                      ? { description }
                      : {})
                  };
                }
              )
          );

      return new ActionRowBuilder()
        .addComponents(menu)
        .toJSON();
    }
  );
}
function createProfessionChoicesPayload(view) {
  const choices =
    Array.isArray(view.choices)
      ? view.choices
      : [];

  const embed =
    createBaseEmbed(view);

  if (choices.length === 0) {
    embed.addFields({
      name: "Profession Choices",
      value:
        "This profession has no additional choices.",
      inline: false
    });
  } else {
    choices.forEach((choice, index) => {
      const optionLines =
        Array.isArray(choice.options)
          ? choice.options.map(
              (option) => {
                const selected =
                  option.id === choice.value
                    ? " ← Selected"
                    : "";

                return `• ${option.name}${selected}`;
              }
            )
          : [];

      embed.addFields({
        name:
          `Choice ${index + 1}: ${formatAttributeName(choice.id)}`,
        value: [
          `**Required:** ${
            choice.required
              ? "Yes"
              : "No"
          }`,
          `**Type:** ${formatAttributeName(choice.type)}`,
          `**Selection:** ${
            choice.value ?? "Not selected"
          }`,
          `**Minimum:** ${choice.minimumSelections}`,
          `**Maximum:** ${choice.maximumSelections}`,
          "",
          optionLines.length
            ? optionLines.join("`n")
            : "No options available."
        ].join("`n"),
        inline: false
      });
    });
  }

  return Object.freeze({
    embeds: [
      embed.toJSON()
    ],
    components: createProfessionChoiceComponents(
        choices
      )
  });
}
function formatKeyValueLines(values) {
  if (
    !values ||
    typeof values !== "object"
  ) {
    return [];
  }

  return Object.entries(values)
    .map(([key, value]) =>
      `**${formatAttributeName(key)}:** ${formatDisplayValue(value)}`
    );
}

function createReviewPayload(view) {
  const review =
    view.review &&
    typeof view.review === "object"
      ? view.review
      : {};

  const embed = createBaseEmbed(view);

  const identityName =
    typeof review.identity?.name === "string" &&
    review.identity.name.trim() !== ""
      ? review.identity.name.trim()
      : "Not entered";

  embed.addFields({
    name: "Identity",
    value: `**Name:** ${identityName}`,
    inline: false
  });

  const attributeLines =
    formatKeyValueLines(
      review.attributes
    );

  embed.addFields({
    name: "Attributes",
    value:
      attributeLines.length > 0
        ? truncateDiscordFieldValue(
            attributeLines.join("\n")
          )
        : "No attributes available.",
    inline: false
  });

  const skillLines =
    formatKeyValueLines(
      review.skills
    );

  const skillChunks =
    skillLines.length > 0
      ? chunkLines(skillLines, 11)
      : [];

  if (skillChunks.length === 0) {
    embed.addFields({
      name: "Skills",
      value: "No skills available.",
      inline: false
    });
  } else {
    skillChunks.forEach(
      (chunk, index) => {
        embed.addFields({
          name:
            index === 0
              ? "Skills"
              : `Skills ${index + 1}`,
          value:
            truncateDiscordFieldValue(
              chunk.join("\n")
            ),
          inline: true
        });
      }
    );
  }

  const professionName =
    typeof review.profession?.name === "string" &&
    review.profession.name.trim() !== ""
      ? review.profession.name.trim()
      : "Not selected";

  const professionLines = [
    `**Profession:** ${professionName}`
  ];

  if (
    review.profession?.mastery !==
    undefined
  ) {
    professionLines.push(
      `**Mastery:** ${
        formatDisplayValue(
          review.profession.mastery
        )
      }`
    );
  }

  embed.addFields({
    name: "Profession",
    value:
      truncateDiscordFieldValue(
        professionLines.join("\n")
      ),
    inline: false
  });

  const choiceLines =
    review.professionChoices &&
    typeof review.professionChoices === "object"
      ? Object.entries(
          review.professionChoices
        ).map(([key, value]) => {
          const displayValue =
            typeof value === "string" &&
            /^[a-z0-9]+(?:_[a-z0-9]+)+$/.test(
              value
            )
              ? formatAttributeName(value)
              : formatDisplayValue(value);

          return `**${formatAttributeName(key)}:** ${displayValue}`;
        })
      : [];

  if (choiceLines.length > 0) {
    embed.addFields({
      name: "Profession Choices",
      value:
        truncateDiscordFieldValue(
          choiceLines.join("\n")
        ),
      inline: false
    });
  }

  const validation =
    review.validation &&
    typeof review.validation === "object"
      ? review.validation
      : {};

  const validationLines = [
    `**Ready to Finalise:** ${
      review.readyToFinalise === true
        ? "Yes"
        : "No"
    }`
  ];

  if (
    Array.isArray(validation.errors) &&
    validation.errors.length > 0
  ) {
    validationLines.push(
      "",
      ...validation.errors.map(
        (error) =>
          `• ${formatDisplayValue(error)}`
      )
    );
  } else {
    validationLines.push(
      "",
      "No validation errors."
    );
  }

  embed.addFields({
    name: "Validation",
    value:
      truncateDiscordFieldValue(
        validationLines.join("\n")
      ),
    inline: false
  });

  if (
    typeof review.contextualSkillNote ===
      "string" &&
    review.contextualSkillNote.trim() !== ""
  ) {
    embed.addFields({
      name: "Note",
      value:
        truncateDiscordFieldValue(
          review.contextualSkillNote.trim()
        ),
      inline: false
    });
  }

  return Object.freeze({
    embeds: [
      embed.toJSON()
    ],
    components: []
  });
}
function createFinishedPayload(view) {
  const character =
    view.character &&
    typeof view.character === "object"
      ? view.character
      : null;

  const embed = createBaseEmbed(view);

  if (!character) {
    embed.addFields({
      name: "Character",
      value:
        "Character creation completed, but no character record was returned.",
      inline: false
    });
  } else {
    const characterName =
      typeof character.name === "string" &&
      character.name.trim() !== ""
        ? character.name.trim()
        : typeof character.identity?.name === "string" &&
          character.identity.name.trim() !== ""
          ? character.identity.name.trim()
          : "Unnamed Character";

    const summaryLines = [
      `**Name:** ${characterName}`
    ];

    if (
      typeof character.id === "string" &&
      character.id.trim() !== ""
    ) {
      summaryLines.push(
        `**Character ID:** ${character.id.trim()}`
      );
    }

    if (
      typeof character.worldId === "string" &&
      character.worldId.trim() !== ""
    ) {
      summaryLines.push(
        `**World:** ${character.worldId.trim()}`
      );
    }

    if (
      typeof character.profession?.name === "string" &&
      character.profession.name.trim() !== ""
    ) {
      summaryLines.push(
        `**Profession:** ${character.profession.name.trim()}`
      );
    } else if (
      typeof character.professionId === "string" &&
      character.professionId.trim() !== ""
    ) {
      summaryLines.push(
        `**Profession:** ${formatAttributeName(
          character.professionId
        )}`
      );
    }

    embed.addFields({
      name:
        view.createdCharacter === false
          ? "Existing Character"
          : "Character Created",
      value:
        truncateDiscordFieldValue(
          summaryLines.join("\n")
        ),
      inline: false
    });
  }

  return Object.freeze({
    embeds: [
      embed.toJSON()
    ],
    components: []
  });
}
function createDiscordCharacterCreationPayload(
  suppliedView,
  options = {}
) {
  const view = requireView(suppliedView);

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.NAME
  ) {
    return createNamePayload(view);
  }
 
  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.ATTRIBUTES
  ) {
    return createAttributesPayload(view);
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.SKILLS
  ) {
    return createSkillsPayload(
      view,
      options
    );
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.PROFESSION
  ) {
    return createProfessionPayload(view);
  }
  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.PROFESSION_CHOICES
  ) {
    return createProfessionChoicesPayload(
      view
    );
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.REVIEW
  ) {
    return createReviewPayload(view);
  }

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.FINISHED
  ) {
    return createFinishedPayload(view);
  }


  throw new Error(
    `Discord rendering is not implemented for stage: ${view.stage}`
  );
}

function createNameModal(suppliedView) {
  const view = requireView(suppliedView);

  if (
    view.stage !==
    CHARACTER_CREATION_STAGE.NAME
  ) {
    throw new Error(
      "The name modal is only available during the name stage."
    );
  }

  const currentName =
    typeof view.values?.name === "string"
      ? view.values.name.trim()
      : "";

  const nameInput =
    new TextInputBuilder()
      .setCustomId("character_name")
      .setLabel("Character name")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(80)
      .setPlaceholder(
        "Enter your character's name"
      );

  if (currentName !== "") {
    nameInput.setValue(currentName);
  }

  return new ModalBuilder()
    .setCustomId(
      DISCORD_CHARACTER_CREATION_ACTION.SUBMIT_NAME
    )
    .setTitle("Choose Your Name")
    .addComponents(
      new ActionRowBuilder()
        .addComponents(nameInput)
    )
    .toJSON();
}

module.exports = {
  CHARACTER_CREATION_STAGE,
  DISCORD_CHARACTER_CREATION_ACTION,
  createDiscordCharacterCreationPayload,
  createNameModal
};
