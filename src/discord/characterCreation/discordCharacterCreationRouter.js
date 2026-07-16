"use strict";

const CREATE_CHARACTER_COMMAND =
  "create-character";

const CHARACTER_CREATION_ACTION = Object.freeze({
  SET_NAME:
    "character_creation:set_name",
  SUBMIT_NAME:
    "character_creation:submit_name",
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
const CHARACTER_NAME_INPUT_ID =
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

  if (parts.length !== 2) {
    return null;
  }

  const [
    skillId,
    direction
  ] = parts;

  if (
    skillId.trim() === "" ||
    (
      direction !== "increase" &&
      direction !== "decrease"
    )
  ) {
    return null;
  }

  return Object.freeze({
    skillId:
      skillId.trim(),
    direction
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
      renderView(view)
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
    SKILL_ACTION_PREFIX,
ATTRIBUTE_ACTION_PREFIX,
  CHARACTER_CREATION_ACTION,
  CHARACTER_NAME_INPUT_ID,
  CREATE_CHARACTER_COMMAND,
  createDiscordCharacterCreationRouter,
  createInteractionIdentity,
  parseAttributeAction,
  parseSkillAction
};