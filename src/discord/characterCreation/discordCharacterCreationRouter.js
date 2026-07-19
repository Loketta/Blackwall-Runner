"use strict";

const CREATE_CHARACTER_COMMAND =
  "create-character";

const CHARACTER_CREATION_ACTION = Object.freeze({
  SET_NAME:
    "character_creation:set_name",
  SUBMIT_NAME:
    "character_creation:submit_name",
  SELECT_PROFESSION:
    "character_creation:select_profession",
  PREVIOUS:
    "character_creation:previous",
  NEXT:
    "character_creation:next",
  CANCEL:
    "character_creation:cancel"
});

const SKILL_ACTION_PREFIX =
  "character_creation:skill:";
const ATTRIBUTE_ACTION_PREFIX =
  "character_creation:attribute:";
const PROFESSION_CHOICE_ACTION_PREFIX =
  "character_creation:profession_choice:";const CHARACTER_NAME_INPUT_ID =
  "character_name";

function requireObject(
  value,
  name
) {
  if (
    !value ||
    typeof value !== "object"
  ) {
    throw new TypeError(
      `${name} must be an object`
    );
  }

  return value;
}

function requireFunction(
  value,
  name
) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${name} must be a function`
    );
  }

  return value;
}

function requireNonEmptyString(
  value,
  name
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${name} must be a non-empty string`
    );
  }

  return value.trim();
}
const SKILL_PAGE_ACTION_PREFIX =
  "character_creation:skills_page:";
function parseSkillAction(
  customId
) {
  if (
    typeof customId !== "string" ||
    !customId.startsWith(
      SKILL_ACTION_PREFIX
    )
  ) {
    return null;
  }

  const remainder =
    customId.slice(
      SKILL_ACTION_PREFIX.length
    );

  const parts =
    remainder.split(":");

  if (
    parts.length !== 2 &&
    parts.length !== 3
  ) {
    return null;
  }

  const [
    skillId,
    direction,
    pageText = "0"
  ] = parts;

  const page =
    Number(pageText);

  if (
    skillId.trim() === "" ||
    (
      direction !== "increase" &&
      direction !== "decrease"
    ) ||
    !Number.isInteger(page) ||
    page < 0
  ) {
    return null;
  }

  return Object.freeze({
    skillId:
      skillId.trim(),
    direction,
    page
  });
}
function parseSkillPageAction(
  customId
) {
  if (
    typeof customId !== "string" ||
    !customId.startsWith(
      SKILL_PAGE_ACTION_PREFIX
    )
  ) {
    return null;
  }

  const pageText =
    customId.slice(
      SKILL_PAGE_ACTION_PREFIX.length
    );

  const page =
    Number(pageText);

  if (
    !Number.isInteger(page) ||
    page < 0
  ) {
    return null;
  }

  return Object.freeze({
    page
  });
}

function parseProfessionChoiceAction(
  customId
) {
  if (
    typeof customId !== "string" ||
    !customId.startsWith(
      PROFESSION_CHOICE_ACTION_PREFIX
    )
  ) {
    return null;
  }

  const choiceId =
    customId.slice(
      PROFESSION_CHOICE_ACTION_PREFIX.length
    ).trim();

  if (
    choiceId === "" ||
    choiceId.includes(":")
  ) {
    return null;
  }

  return Object.freeze({
    choiceId
  });
}
function parseAttributeAction(
  customId
) {
  if (
    typeof customId !== "string" ||
    !customId.startsWith(
      ATTRIBUTE_ACTION_PREFIX
    )
  ) {
    return null;
  }

  const remainder =
    customId.slice(
      ATTRIBUTE_ACTION_PREFIX.length
    );

  const parts =
    remainder.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const [
    attributeId,
    direction
  ] = parts;

  if (
    attributeId.trim() === "" ||
    (
      direction !== "increase" &&
      direction !== "decrease"
    )
  ) {
    return null;
  }

  return Object.freeze({
    attributeId:
      attributeId.trim(),
    direction
  });
}
function createInteractionIdentity(
  interaction
) {
  requireObject(
    interaction,
    "interaction"
  );

  const user =
    requireObject(
      interaction.user,
      "interaction.user"
    );

  return Object.freeze({
    guildId:
      requireNonEmptyString(
        interaction.guildId,
        "interaction.guildId"
      ),

    channelId:
      requireNonEmptyString(
        interaction.channelId,
        "interaction.channelId"
      ),

    ownerId:
      requireNonEmptyString(
        user.id,
        "interaction.user.id"
      )
  });
}

function requireSession(
  sessionRegistry,
  identity
) {
  const session =
    sessionRegistry.get(identity);

  if (!session) {
    throw new Error(
      "No active Discord character creation session exists for this interaction"
    );
  }

  return session;
}

function createDiscordCharacterCreationRouter({
  sessionRegistry,
  renderView,
  createNameModal
}) {
  requireObject(
    sessionRegistry,
    "sessionRegistry"
  );

  requireFunction(
    sessionRegistry.getOrStart,
    "sessionRegistry.getOrStart"
  );

  requireFunction(
    sessionRegistry.get,
    "sessionRegistry.get"
  );

  requireFunction(
    sessionRegistry.remove,
    "sessionRegistry.remove"
  );

  requireFunction(
    renderView,
    "renderView"
  );

  requireFunction(
    createNameModal,
    "createNameModal"
  );

  async function handleCreateCharacter(
    interaction
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const {
      session,
      created
    } =
      sessionRegistry.getOrStart(
        identity
      );

    requireObject(
      session,
      "session"
    );

    let view;

    if (created) {
      requireFunction(
        session.start,
        "session.start"
      );

      view = session.start({
        ownerId: identity.ownerId
      });
    } else {
      requireFunction(
        session.getCurrentView,
        "session.getCurrentView"
      );

      view =
        session.getCurrentView();
    }

    const payload = {
      ...renderView(view),
      ephemeral: true
    };

    await interaction.reply(payload);

    return Object.freeze({
      handled: true,
      action:
        created
          ? "start"
          : "resume",
      view
    });
  }

  async function handleSetName(
    interaction
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.getCurrentView,
      "session.getCurrentView"
    );

    const view =
      session.getCurrentView();

    const modal =
      createNameModal(view);

    await interaction.showModal(
      modal
    );

    return Object.freeze({
      handled: true,
      action: "set_name",
      view
    });
  }

  async function handleSubmitName(
    interaction
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.submitName,
      "session.submitName"
    );

    const fields =
      requireObject(
        interaction.fields,
        "interaction.fields"
      );

    requireFunction(
      fields.getTextInputValue,
      "interaction.fields.getTextInputValue"
    );

    const name =
      fields.getTextInputValue(
        CHARACTER_NAME_INPUT_ID
      );

    const view =
      session.submitName(name);

    await interaction.update(
      renderView(view)
    );

    return Object.freeze({
      handled: true,
      action: "submit_name",
      view
    });
  }
async function handleSkillAction(
    interaction,
    action
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.getCurrentView,
      "session.getCurrentView"
    );

    requireFunction(
      session.setSkill,
      "session.setSkill"
    );

    const currentView =
      session.getCurrentView();

    if (
      currentView.stage !==
        "skills"
    ) {
      throw new Error(
        "Skill controls are only available during the skills stage"
      );
    }

    const currentValue =
      currentView.values?.[
        action.skillId
      ];

    if (!Number.isInteger(currentValue)) {
      throw new Error(
        `Skill ${action.skillId} is not available in the current view`
      );
    }

    const nextValue =
      action.direction === "increase"
        ? currentValue + 1
        : currentValue - 1;

    const view =
      session.setSkill({
        skillId:
          action.skillId,
        value: nextValue
      });

    await interaction.update(
      renderView(
        view,
        {
          skillPage:
            action.page
        }
      )
    );

    return Object.freeze({
      handled: true,
      action:
        action.direction === "increase"
          ? "increase_skill"
          : "decrease_skill",
      skillId:
        action.skillId,
      value: nextValue,
      skillPage:
        action.page,
      view
    });
  }
async function handleSkillPageAction(
    interaction,
    action
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.getCurrentView,
      "session.getCurrentView"
    );

    const view =
      session.getCurrentView();

    if (
      view.stage !==
        "skills"
    ) {
      throw new Error(
        "Skill page controls are only available during the skills stage"
      );
    }

    await interaction.update(
      renderView(
        view,
        {
          skillPage:
            action.page
        }
      )
    );

    return Object.freeze({
      handled: true,
      action: "change_skills_page",
      skillPage:
        action.page,
      view
    });
  }
  async function handleProfessionSelection(
    interaction
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.getCurrentView,
      "session.getCurrentView"
    );

    requireFunction(
      session.setProfession,
      "session.setProfession"
    );

    const currentView =
      session.getCurrentView();

    if (
      currentView.stage !==
        "profession"
    ) {
      throw new Error(
        "Profession controls are only available during the profession stage"
      );
    }

    const values =
      Array.isArray(
        interaction.values
      )
        ? interaction.values
        : [];

    if (values.length !== 1) {
      throw new Error(
        "Profession selection must contain exactly one value"
      );
    }

    const professionId =
      requireNonEmptyString(
        values[0],
        "interaction.values[0]"
      );

    const view =
      session.setProfession({
        professionId
      });

    await interaction.update(
      renderView(view)
    );

    return Object.freeze({
      handled: true,
      action: "select_profession",
      professionId,
      view
    });
  }

  async function handleProfessionChoice(
    interaction,
    action
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.getCurrentView,
      "session.getCurrentView"
    );

    requireFunction(
      session.setProfessionChoice,
      "session.setProfessionChoice"
    );

    const currentView =
      session.getCurrentView();

    if (
      currentView.stage !==
        "profession"
    ) {
      throw new Error(
        "Profession choice controls are only available during the profession stage"
      );
    }

    const values =
      Array.isArray(
        interaction.values
      )
        ? interaction.values
        : [];

    if (values.length !== 1) {
      throw new Error(
        "Profession choice selection must contain exactly one value"
      );
    }

    const value =
      requireNonEmptyString(
        values[0],
        "interaction.values[0]"
      );

    const view =
      session.setProfessionChoice({
        choiceId:
          action.choiceId,
        value
      });

    await interaction.update(
      renderView(view)
    );

    return Object.freeze({
      handled: true,
      action:
        "select_profession_choice",
      choiceId:
        action.choiceId,
      value,
      view
    });
  }
  async function handleAttributeAction(
    interaction,
    action
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.getCurrentView,
      "session.getCurrentView"
    );

    requireFunction(
      session.setAttribute,
      "session.setAttribute"
    );

    const currentView =
      session.getCurrentView();

    if (
      currentView.stage !==
        "attributes"
    ) {
      throw new Error(
        "Attribute controls are only available during the attributes stage"
      );
    }

    const currentValue =
      currentView.values?.[
        action.attributeId
      ];

    if (!Number.isInteger(currentValue)) {
      throw new Error(
        `Attribute ${action.attributeId} is not available in the current view`
      );
    }

    const nextValue =
      action.direction === "increase"
        ? currentValue + 1
        : currentValue - 1;

    const view =
      session.setAttribute({
        attributeId:
          action.attributeId,
        value: nextValue
      });

    await interaction.update(
      renderView(view)
    );

    return Object.freeze({
      handled: true,
      action:
        action.direction === "increase"
          ? "increase_attribute"
          : "decrease_attribute",
      attributeId:
        action.attributeId,
      value: nextValue,
      view
    });
  }
  async function handlePrevious(
    interaction
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.previous,
      "session.previous"
    );

    const view =
      session.previous();

    await interaction.update(
      renderView(view)
    );

    return Object.freeze({
      handled: true,
      action: "previous",
      view
    });
  }

  async function handleNext(
    interaction
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.next,
      "session.next"
    );

    const view =
      session.next();

    await interaction.update(
      renderView(view)
    );

    return Object.freeze({
      handled: true,
      action: "next",
      view
    });
  }
  async function handleCancel(
    interaction
  ) {
    const identity =
      createInteractionIdentity(
        interaction
      );

    const session =
      requireSession(
        sessionRegistry,
        identity
      );

    requireFunction(
      session.cancel,
      "session.cancel"
    );

    const result =
      session.cancel();

    sessionRegistry.remove(
      identity
    );

    await interaction.update({
      content:
        "Character creation closed. Your draft can be resumed later.",
      embeds: [],
      components: []
    });

    return Object.freeze({
      handled: true,
      action: "cancel",
      result
    });
  }
async function route(interaction) {
    requireObject(
      interaction,
      "interaction"
    );

    requireFunction(
      interaction.isChatInputCommand,
      "interaction.isChatInputCommand"
    );

    requireFunction(
      interaction.isButton,
      "interaction.isButton"
    );

    requireFunction(
      interaction.isModalSubmit,
      "interaction.isModalSubmit"
    );
    requireFunction(
      interaction.isStringSelectMenu,
      "interaction.isStringSelectMenu"
    );

    if (
      interaction.isChatInputCommand() &&
      interaction.commandName ===
        CREATE_CHARACTER_COMMAND
    ) {
      requireFunction(
        interaction.reply,
        "interaction.reply"
      );

      return handleCreateCharacter(
        interaction
      );
    }

    if (interaction.isButton()) {
      if (
        interaction.customId ===
        CHARACTER_CREATION_ACTION.SET_NAME
      ) {
        requireFunction(
          interaction.showModal,
          "interaction.showModal"
        );

        return handleSetName(
          interaction
        );
      }
      const attributeAction =
        parseAttributeAction(
          interaction.customId
        );

      if (attributeAction) {
        requireFunction(
          interaction.update,
          "interaction.update"
        );

        return handleAttributeAction(
          interaction,
          attributeAction
        );
      }
      const skillAction =
        parseSkillAction(
          interaction.customId
        );

      if (skillAction) {
        requireFunction(
          interaction.update,
          "interaction.update"
        );

        return handleSkillAction(
          interaction,
          skillAction
        );
      }
      const skillPageAction =
        parseSkillPageAction(
          interaction.customId
        );

      if (skillPageAction) {
        requireFunction(
          interaction.update,
          "interaction.update"
        );

        return handleSkillPageAction(
          interaction,
          skillPageAction
        );
      }

            if (
        interaction.customId ===
        CHARACTER_CREATION_ACTION.PREVIOUS
      ) {
        requireFunction(
          interaction.update,
          "interaction.update"
        );

        return handlePrevious(
          interaction
        );
      }

      if (
        interaction.customId ===
        CHARACTER_CREATION_ACTION.NEXT
      ) {
        requireFunction(
          interaction.update,
          "interaction.update"
        );

        return handleNext(
          interaction
        );
      }
if (
        interaction.customId ===
        CHARACTER_CREATION_ACTION.CANCEL
      ) {
        requireFunction(
          interaction.update,
          "interaction.update"
        );

        return handleCancel(
          interaction
        );
      }
    }

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId ===
        CHARACTER_CREATION_ACTION
          .SELECT_PROFESSION
    ) {
      requireFunction(
        interaction.update,
        "interaction.update"
      );

      return handleProfessionSelection(
        interaction
      );
    }


    if (
      interaction.isStringSelectMenu()
    ) {
      const professionChoiceAction =
        parseProfessionChoiceAction(
          interaction.customId
        );

      if (professionChoiceAction) {
        requireFunction(
          interaction.update,
          "interaction.update"
        );

        return handleProfessionChoice(
          interaction,
          professionChoiceAction
        );
      }
    }
    if (
      interaction.isModalSubmit() &&
      interaction.customId ===
        CHARACTER_CREATION_ACTION.SUBMIT_NAME
    ) {
      requireFunction(
        interaction.update,
        "interaction.update"
      );

      return handleSubmitName(
        interaction
      );
    }

    return Object.freeze({
      handled: false
    });
  }

  return Object.freeze({
    route
  });
}

module.exports = {
  ATTRIBUTE_ACTION_PREFIX,
  CHARACTER_CREATION_ACTION,
  CHARACTER_NAME_INPUT_ID,
  CREATE_CHARACTER_COMMAND,
  PROFESSION_CHOICE_ACTION_PREFIX,
  SKILL_ACTION_PREFIX,
  SKILL_PAGE_ACTION_PREFIX,
  createDiscordCharacterCreationRouter,
  createInteractionIdentity,
  parseAttributeAction,
  parseProfessionChoiceAction,
  parseSkillAction,
  parseSkillPageAction
};
