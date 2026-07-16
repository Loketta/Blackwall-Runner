"use strict";

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
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
    CANCEL:
      "character_creation:cancel"
  });

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

function createDiscordCharacterCreationPayload(
  suppliedView
) {
  const view = requireView(suppliedView);

  if (
    view.stage ===
    CHARACTER_CREATION_STAGE.NAME
  ) {
    return createNamePayload(view);
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
