"use strict";

const readline = require("readline");

const {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES
} = require("../game/characterCreation/characterCreationDefinition");

const {
  SKILL_CREATION_RULES,
  getSkillDefinitions
} = require("../game/characterCreation/skillDefinitions");

const {
  getProfessionDefinitions
} = require("../game/characterCreation/professionDefinitions");

const {
  getWeaponTypeDefinitions
} = require("../game/characterCreation/weaponTypeDefinitions");

function calculateTotal(values) {
  return Object.values(values).reduce(
    (total, value) => total + value,
    0
  );
}

function formatDraft(draft) {
  const attributeTotal = calculateTotal(
    draft.attributes
  );

  const skillTotal = calculateTotal(
    draft.skills
  );

  const trainedSkills = getSkillDefinitions()
    .filter(
      (skill) => draft.skills[skill.id] > 0
    )
    .map(
      (skill) =>
        `${skill.name}: ${draft.skills[skill.id]}`
    );

  return [
    "",
    "================================",
    "CHARACTER DRAFT",
    "================================",
    `Draft ID: ${draft.id}`,
    `Revision: ${draft.revision}`,
    `Status: ${draft.status}`,
    `Name: ${draft.identity.name ?? "(not set)"}`,
    "",
    "ATTRIBUTES",
    ...CORE_ATTRIBUTES.map(
      (attributeId) =>
        `${attributeId}: ${draft.attributes[attributeId]}`
    ),
    `Points used: ${attributeTotal}/${ATTRIBUTE_RULES.totalBudget}`,
    "",
    "TRAINED SKILLS",
    ...(trainedSkills.length > 0
      ? trainedSkills
      : ["(none)"]),
    `Points used: ${skillTotal}/${SKILL_CREATION_RULES.totalBudget}`,
    "",
    `Profession: ${draft.profession ?? "(not selected)"}`,
    `Profession choices: ${JSON.stringify(
      draft.professionChoices
    )}`,
    "================================",
    ""
  ].join("\n");
}

function formatValidation(validation) {
  if (validation.valid) {
    return "Character draft is valid.";
  }

  return [
    "Character draft is not valid:",
    ...validation.errors.map(
      (error) =>
        `- [${error.code}] ${error.message}`
    )
  ].join("\n");
}

function formatHelp() {
  return [
    "",
    "Commands:",
    "  help",
    "  show",
    "  name <character name>",
    "  attribute <attribute-id> <value>",
    "  skill <skill-id> <value>",
    "  profession <profession-id>",
    "  choice <choice-id> <value>",
    "  attributes",
    "  skills",
    "  professions",
    "  weapons",
    "  validate",
    "  finalise",
    "  quit",
    ""
  ].join("\n");
}

function parseInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new TypeError(
      `${fieldName} must be a whole number.`
    );
  }

  return parsed;
}

function createCharacterCreationCli({
  application,
  ownerId,
  platform = "cli",
  startingLocation = "back_alley_1",
  startingCredits = 0,
  startingInventory = [],
  input = process.stdin,
  output = process.stdout
}) {
  if (!application || typeof application !== "object") {
    throw new TypeError(
      "application must be an object."
    );
  }

  let currentDraft = null;

  function write(message = "") {
    output.write(`${message}\n`);
  }

  function requireCurrentDraft() {
    if (!currentDraft) {
      throw new Error(
        "No active character draft is loaded."
      );
    }

    return currentDraft;
  }

  function startOrResume() {
    const result = application.startOrResume({
      ownerId,
      platform
    });

    currentDraft = result.draft;

    write(
      result.created
        ? `Created draft ${currentDraft.id}.`
        : `Resumed draft ${currentDraft.id}.`
    );

    write(formatDraft(currentDraft));
  }

  function applyResult(result) {
    currentDraft = result.draft;
    write(formatDraft(currentDraft));
  }

  function handleCommand(line) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      return true;
    }

    const [command, ...argumentsList] =
      trimmed.split(/\s+/);

    switch (command.toLowerCase()) {
      case "help":
        write(formatHelp());
        return true;

      case "show":
        write(
          formatDraft(requireCurrentDraft())
        );
        return true;

      case "name":
        applyResult(
          application.setName({
            draft: requireCurrentDraft(),
            expectedRevision:
              currentDraft.revision,
            name: argumentsList.join(" ")
          })
        );
        return true;

      case "attribute":
        applyResult(
          application.setAttribute({
            draft: requireCurrentDraft(),
            expectedRevision:
              currentDraft.revision,
            attributeId: argumentsList[0],
            value: parseInteger(
              argumentsList[1],
              "Attribute value"
            )
          })
        );
        return true;

      case "skill":
        applyResult(
          application.setSkill({
            draft: requireCurrentDraft(),
            expectedRevision:
              currentDraft.revision,
            skillId: argumentsList[0],
            value: parseInteger(
              argumentsList[1],
              "Skill value"
            )
          })
        );
        return true;

      case "profession":
        applyResult(
          application.setProfession({
            draft: requireCurrentDraft(),
            expectedRevision:
              currentDraft.revision,
            professionId: argumentsList[0]
          })
        );
        return true;

      case "choice":
        applyResult(
          application.setProfessionChoice({
            draft: requireCurrentDraft(),
            expectedRevision:
              currentDraft.revision,
            choiceId: argumentsList[0],
            value: argumentsList[1]
          })
        );
        return true;

      case "attributes":
        write(
          CORE_ATTRIBUTES.join("\n")
        );
        return true;

      case "skills":
        write(
          getSkillDefinitions()
            .map(
              (skill) =>
                `${skill.id} — ${skill.name} (${skill.defaultAttribute})`
            )
            .join("\n")
        );
        return true;

      case "professions":
        write(
          getProfessionDefinitions()
            .map(
              (profession) =>
                `${profession.id} — ${profession.name}`
            )
            .join("\n")
        );
        return true;

      case "weapons":
        write(
          getWeaponTypeDefinitions()
            .map(
              (weaponType) =>
                `${weaponType.id} — ${weaponType.name}`
            )
            .join("\n")
        );
        return true;

      case "validate":
        write(
          formatValidation(
            application.validate(
              requireCurrentDraft()
            )
          )
        );
        return true;

      case "finalise": {
        const result = application.finalise({
          draft: requireCurrentDraft(),
          expectedRevision:
            currentDraft.revision,
          startingLocation,
          startingCredits,
          startingInventory
        });

        currentDraft =
          result.finalisedDraft;

        write(
          result.created
            ? `Created character ${result.character.id}.`
            : `Character ${result.character.id} already existed.`
        );

        write(
          JSON.stringify(
            result.character,
            null,
            2
          )
        );

        return true;
      }

      case "quit":
      case "exit":
        return false;

      default:
        write(
          `Unknown command: ${command}`
        );
        write(formatHelp());
        return true;
    }
  }

  function run() {
    startOrResume();
    write(formatHelp());

    const interfaceInstance =
      readline.createInterface({
        input,
        output,
        terminal:
          Boolean(input.isTTY && output.isTTY)
      });

    interfaceInstance.setPrompt(
      "character> "
    );

    interfaceInstance.prompt();

    interfaceInstance.on(
      "line",
      (line) => {
        try {
          const continueRunning =
            handleCommand(line);

          if (!continueRunning) {
            interfaceInstance.close();
            return;
          }
        } catch (error) {
          write(
            `${error.name}: ${error.message}`
          );
        }

        interfaceInstance.prompt();
      }
    );

    interfaceInstance.on(
      "close",
      () => {
        write("Character creator closed.");
      }
    );

    return interfaceInstance;
  }

  return Object.freeze({
    run,
    handleCommand,
    startOrResume,
    getCurrentDraft() {
      return currentDraft;
    }
  });
}

module.exports = {
  formatDraft,
  formatValidation,
  formatHelp,
  createCharacterCreationCli
};