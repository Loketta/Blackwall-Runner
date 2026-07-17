"use strict";

const assert = require("assert");

const {
  ATTRIBUTE_ACTION_PREFIX,
  CHARACTER_CREATION_ACTION,
  CHARACTER_NAME_INPUT_ID,
  CREATE_CHARACTER_COMMAND,
  createDiscordCharacterCreationRouter,
  createInteractionIdentity,
  parseAttributeAction,
  SKILL_ACTION_PREFIX,
  SKILL_PAGE_ACTION_PREFIX,
  parseSkillAction,
  parseSkillPageAction
} = require(
  "../../src/discord/characterCreation/discordCharacterCreationRouter"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createView(
  stage,
  overrides = {}
) {
  return Object.freeze({
    stage,
    stageNumber: 1,
    stageCount: 7,
    title: stage,
    description: "",
    values: {},
    canMoveNext: false,
    canMovePrevious: false,
    ...overrides
  });
}

function createIdentity(
  overrides = {}
) {
  return {
    guildId: "guild-1",
    channelId: "channel-1",
    ownerId: "user-1",
    ...overrides
  };
}

function createSessionHarness() {
  const nameView =
    createView("name");

  const attributeView =
    createView(
      "attributes",
      {
        stageNumber: 2,
        canMovePrevious: true,
        values: {
          force: 4
        }
      }
    );
  const skillView =
    createView(
      "skills",
      {
        stageNumber: 3,
        canMovePrevious: true,
        values: {
          computers: 3
        }
      }
    );

  const calls = [];

  let currentView = nameView;
  let active = false;

  const session = {
    start(input) {
      calls.push({
        method: "start",
        input
      });

      active = true;
      currentView = nameView;

      return currentView;
    },

    getCurrentView() {
      calls.push({
        method: "getCurrentView"
      });

      return currentView;
    },

    setSkill(input) {
      calls.push({
        method: "setSkill",
        input
      });

      currentView =
        createView(
          "skills",
          {
            stageNumber: 3,
            canMovePrevious: true,
            values: {
              computers: input.value
            }
          }
        );

      return currentView;
    },
    setAttribute(input) {
      calls.push({
        method: "setAttribute",
        input
      });

      currentView =
        createView(
          "attributes",
          {
            stageNumber: 2,
            canMovePrevious: true,
            values: {
              force:
                input.value
            }
          }
        );

      return currentView;
    },
    moveToSkills() {
      currentView = skillView;
    },
    submitName(name) {
      calls.push({
        method: "submitName",
        name
      });

      currentView = attributeView;

      return currentView;
    },

    previous() {
      calls.push({
        method: "previous"
      });

      currentView = nameView;

      return currentView;
    },

    next() {
      calls.push({
        method: "next"
      });

      currentView = attributeView;

      return currentView;
    },
    cancel() {
      calls.push({
        method: "cancel"
      });

      active = false;

      return {
        cancelled: true,
        draftId: "draft-1"
      };
    },

    isActive() {
      return active;
    }
  };

  return {
    calls,
    session,
    views: {
      nameView,
      attributeView
    }
  };
}

function createRegistryHarness() {
  const sessionHarness =
    createSessionHarness();

  const sessions =
    new Map();

  const calls = [];

  function key(identity) {
    return [
      identity.guildId,
      identity.channelId,
      identity.ownerId
    ].join(":");
  }

  const registry = {
    getOrStart(identity) {
      calls.push({
        method: "getOrStart",
        identity
      });

      const sessionKey =
        key(identity);

      if (sessions.has(sessionKey)) {
        return {
          session:
            sessions.get(sessionKey),
          created: false
        };
      }

      sessions.set(
        sessionKey,
        sessionHarness.session
      );

      return {
        session:
          sessionHarness.session,
        created: true
      };
    },

    get(identity) {
      calls.push({
        method: "get",
        identity
      });

      return (
        sessions.get(key(identity)) ||
        null
      );
    },

    remove(identity) {
      calls.push({
        method: "remove",
        identity
      });

      const sessionKey =
        key(identity);

      const session =
        sessions.get(sessionKey) ||
        null;

      sessions.delete(sessionKey);

      return session;
    },

    seed(identity) {
      sessions.set(
        key(identity),
        sessionHarness.session
      );
    },

    has(identity) {
      return sessions.has(
        key(identity)
      );
    }
  };

  return {
    calls,
    registry,
    sessionHarness
  };
}

function createInteraction(
  overrides = {}
) {
  const calls = [];

  const interaction = {
    guildId: "guild-1",
    channelId: "channel-1",

    user: {
      id: "user-1"
    },

    commandName: null,
    customId: null,

    isChatInputCommand() {
      return false;
    },

    isButton() {
      return false;
    },

    isModalSubmit() {
      return false;
    },

    async reply(payload) {
      calls.push({
        method: "reply",
        payload
      });
    },

    async showModal(modal) {
      calls.push({
        method: "showModal",
        modal
      });
    },

    async update(payload) {
      calls.push({
        method: "update",
        payload
      });
    },

    fields: {
      getTextInputValue(inputId) {
        calls.push({
          method:
            "getTextInputValue",
          inputId
        });

        return "Naoko";
      }
    },

    ...overrides
  };

  return {
    calls,
    interaction
  };
}

function createRouterHarness() {
  const registryHarness =
    createRegistryHarness();

  const renderCalls = [];
  const renderOptionsCalls = [];
  const modalCalls = [];

  function renderView(
    view,
    options = {}
  ) {
    renderCalls.push(view);
    renderOptionsCalls.push(options);

    return {
      embeds: [
        {
          title: view.title
        }
      ],

      components: [
        {
          type: 1
        }
      ]
    };
  }

  function createNameModal(view) {
    modalCalls.push(view);

    return {
      custom_id:
        CHARACTER_CREATION_ACTION
          .SUBMIT_NAME,

      title: "Set Character Name"
    };
  }

  const router =
    createDiscordCharacterCreationRouter({
      sessionRegistry:
        registryHarness.registry,
      renderView,
      createNameModal
    });

  return {
    router,
    registryHarness,
    renderCalls,
    renderOptionsCalls,
    modalCalls
  };
}

test(
  "Creates an interaction identity",
  () => {
    const identity =
      createInteractionIdentity({
        guildId: "guild-1",
        channelId: "channel-1",

        user: {
          id: "user-1"
        }
      });

    assert.deepStrictEqual(
      identity,
      createIdentity()
    );

    assert.strictEqual(
      Object.isFrozen(identity),
      true
    );
  }
);

test(
  "Starts character creation from the slash command",
  async () => {
    const {

      router,
      registryHarness,
      renderCalls
    } = createRouterHarness();

    const {

      interaction,
      calls
    } = createInteraction({
      commandName:
        CREATE_CHARACTER_COMMAND,

      isChatInputCommand() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "start"
    );

    assert.strictEqual(
      result.view.stage,
      "name"
    );

    assert.deepStrictEqual(
      registryHarness
        .sessionHarness
        .calls[0],
      {
        method: "start",
        input: {
          ownerId: "user-1"
        }
      }
    );

    assert.strictEqual(
      renderCalls.length,
      1
    );

    assert.strictEqual(
      calls.length,
      1
    );

    assert.strictEqual(
      calls[0].method,
      "reply"
    );

    assert.strictEqual(
      calls[0].payload.ephemeral,
      true
    );

    assert.strictEqual(
      calls[0].payload
        .embeds[0].title,
      "name"
    );
  }
);

test(
  "Resumes an existing character creation session",
  async () => {
    const {

      router,
      registryHarness
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    const {

      interaction
    } = createInteraction({
      commandName:
        CREATE_CHARACTER_COMMAND,

      isChatInputCommand() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "resume"
    );

    assert.strictEqual(
      registryHarness
        .sessionHarness
        .calls.some(
          (call) =>
            call.method ===
            "getCurrentView"
        ),
      true
    );

    assert.strictEqual(
      registryHarness
        .sessionHarness
        .calls.some(
          (call) =>
            call.method ===
            "start"
        ),
      false
    );
  }
);

test(
  "Opens the name modal",
  async () => {
    const {

      router,
      registryHarness,
      modalCalls
    } = createRouterHarness();

    registryHarness.registry.seed(
      createIdentity()
    );

    const {

      interaction,
      calls
    } = createInteraction({
      customId:
        CHARACTER_CREATION_ACTION
          .SET_NAME,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "set_name"
    );

    assert.strictEqual(
      result.view.stage,
      "name"
    );

    assert.strictEqual(
      modalCalls.length,
      1
    );

    assert.strictEqual(
      calls.length,
      1
    );

    assert.strictEqual(
      calls[0].method,
      "showModal"
    );

    assert.strictEqual(
      calls[0].modal.custom_id,
      CHARACTER_CREATION_ACTION
        .SUBMIT_NAME
    );
  }
);

test(
  "Submits a name and updates the interaction",
  async () => {
    const {

      router,
      registryHarness,
      renderCalls
    } = createRouterHarness();

    registryHarness.registry.seed(
      createIdentity()
    );

    const {

      interaction,
      calls
    } = createInteraction({
      customId:
        CHARACTER_CREATION_ACTION
          .SUBMIT_NAME,

      isModalSubmit() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "submit_name"
    );

    assert.strictEqual(
      result.view.stage,
      "attributes"
    );

    const submitCall =
      registryHarness
        .sessionHarness
        .calls.find(
          (call) =>
            call.method ===
            "submitName"
        );

    assert.deepStrictEqual(
      submitCall,
      {
        method: "submitName",
        name: "Naoko"
      }
    );

    const fieldCall =
      calls.find(
        (call) =>
          call.method ===
          "getTextInputValue"
      );

    assert.deepStrictEqual(
      fieldCall,
      {
        method:
          "getTextInputValue",
        inputId:
          CHARACTER_NAME_INPUT_ID
      }
    );

    assert.strictEqual(
      renderCalls.length,
      1
    );

    const updateCall =
      calls.find(
        (call) =>
          call.method ===
          "update"
      );

    assert.strictEqual(
      updateCall.payload
        .embeds[0].title,
      "attributes"
    );
  }
);

test(
  "Moves to the previous character creation stage",
  async () => {
    const {

      router,
      registryHarness
    } = createRouterHarness();

    registryHarness.registry.seed(
      createIdentity()
    );

    const {

      interaction,
      calls
    } = createInteraction({
      customId:
        CHARACTER_CREATION_ACTION.PREVIOUS,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "previous"
    );

    assert.strictEqual(
      result.view.stage,
      "name"
    );

    assert.strictEqual(
      registryHarness
        .sessionHarness
        .calls.some(
          (call) =>
            call.method === "previous"
        ),
      true
    );

    assert.strictEqual(
      calls.some(
        (call) =>
          call.method === "update"
      ),
      true
    );
  }
);

test(
  "Moves to the next character creation stage",
  async () => {
    const {

      router,
      registryHarness
    } = createRouterHarness();

    registryHarness.registry.seed(
      createIdentity()
    );

    const {

      interaction,
      calls
    } = createInteraction({
      customId:
        CHARACTER_CREATION_ACTION.NEXT,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "next"
    );

    assert.strictEqual(
      result.view.stage,
      "attributes"
    );

    assert.strictEqual(
      registryHarness
        .sessionHarness
        .calls.some(
          (call) =>
            call.method === "next"
        ),
      true
    );

    assert.strictEqual(
      calls.some(
        (call) =>
          call.method === "update"
      ),
      true
    );
  }
);
test(
  "Parses attribute interaction actions",
  () => {
    assert.deepStrictEqual(
      parseAttributeAction(
        `${ATTRIBUTE_ACTION_PREFIX}force:increase`
      ),
      {
        attributeId: "force",
        direction: "increase"
      }
    );

    assert.deepStrictEqual(
      parseAttributeAction(
        `${ATTRIBUTE_ACTION_PREFIX}agility:decrease`
      ),
      {
        attributeId: "agility",
        direction: "decrease"
      }
    );

    assert.strictEqual(
      parseAttributeAction(
        "character_creation:other"
      ),
      null
    );

    assert.strictEqual(
      parseAttributeAction(
        `${ATTRIBUTE_ACTION_PREFIX}force:invalid`
      ),
      null
    );
  }
);

test(
  "Increases an attribute from a Discord button",
  async () => {
    const {
      router,
      registryHarness
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    registryHarness
      .sessionHarness
      .session
      .submitName("Naoko");

    const {
      interaction,
      calls
    } = createInteraction({
      customId:
        `${ATTRIBUTE_ACTION_PREFIX}force:increase`,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "increase_attribute"
    );

    assert.strictEqual(
      result.attributeId,
      "force"
    );

    assert.strictEqual(
      result.value,
      5
    );

    const setCall =
      registryHarness
        .sessionHarness
        .calls.find(
          (call) =>
            call.method ===
            "setAttribute"
        );

    assert.deepStrictEqual(
      setCall,
      {
        method: "setAttribute",
        input: {
          attributeId: "force",
          value: 5
        }
      }
    );

    assert.strictEqual(
      calls.some(
        (call) =>
          call.method === "update"
      ),
      true
    );
  }
);

test(
  "Decreases an attribute from a Discord button",
  async () => {
    const {
      router,
      registryHarness
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    registryHarness
      .sessionHarness
      .session
      .submitName("Naoko");

    const {
      interaction
    } = createInteraction({
      customId:
        `${ATTRIBUTE_ACTION_PREFIX}force:decrease`,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.action,
      "decrease_attribute"
    );

    assert.strictEqual(
      result.value,
      3
    );
  }
);
test(
  "Parses skill interaction actions",
  () => {
    assert.deepStrictEqual(
      parseSkillAction(
        `${SKILL_ACTION_PREFIX}computers:increase`
      ),
      {
        skillId: "computers",
        direction: "increase",
        page: 0
      }
    );

    assert.deepStrictEqual(
      parseSkillAction(
        `${SKILL_ACTION_PREFIX}stealth:decrease`
      ),
      {
        skillId: "stealth",
        direction: "decrease",
        page: 0
      }
    );

    assert.strictEqual(
      parseSkillAction(
        "character_creation:other"
      ),
      null
    );

    assert.strictEqual(
      parseSkillAction(
        `${SKILL_ACTION_PREFIX}computers:invalid`
      ),
      null
    );
  }
);

test(
  "Parses paged skill interaction actions",
  () => {
    assert.deepStrictEqual(
      parseSkillAction(
        `${SKILL_ACTION_PREFIX}computers:increase:2`
      ),
      {
        skillId: "computers",
        direction: "increase",
        page: 2
      }
    );

    assert.deepStrictEqual(
      parseSkillPageAction(
        `${SKILL_PAGE_ACTION_PREFIX}3`
      ),
      {
        page: 3
      }
    );

    assert.strictEqual(
      parseSkillPageAction(
        `${SKILL_PAGE_ACTION_PREFIX}-1`
      ),
      null
    );

    assert.strictEqual(
      parseSkillPageAction(
        `${SKILL_PAGE_ACTION_PREFIX}invalid`
      ),
      null
    );
  }
);

test(
  "Increases a skill from a Discord button",
  async () => {
    const {
      router,
      registryHarness
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    registryHarness
      .sessionHarness
      .session
      .submitName("Naoko");

    registryHarness
      .sessionHarness
      .session
      .moveToSkills();

    const {
      interaction,
      calls
    } = createInteraction({
      customId:
        `${SKILL_ACTION_PREFIX}computers:increase`,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "increase_skill"
    );

    assert.strictEqual(
      result.skillId,
      "computers"
    );

    assert.strictEqual(
      result.value,
      4
    );

    assert.deepStrictEqual(
      registryHarness
        .sessionHarness
        .calls
        .find(
          (call) =>
            call.method === "setSkill"
        )
        .input,
      {
        skillId: "computers",
        value: 4
      }
    );

    assert.strictEqual(
      calls.some(
        (call) =>
          call.method === "update"
      ),
      true
    );
  }
);

test(
  "Decreases a skill from a Discord button",
  async () => {
    const {
      router,
      registryHarness
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    registryHarness
      .sessionHarness
      .session
      .submitName("Naoko");

    registryHarness
      .sessionHarness
      .session
      .moveToSkills();

    const {
      interaction,
      calls
    } = createInteraction({
      customId:
        `${SKILL_ACTION_PREFIX}computers:decrease`,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "decrease_skill"
    );

    assert.strictEqual(
      result.skillId,
      "computers"
    );

    assert.strictEqual(
      result.value,
      2
    );

    assert.deepStrictEqual(
      registryHarness
        .sessionHarness
        .calls
        .find(
          (call) =>
            call.method === "setSkill"
        )
        .input,
      {
        skillId: "computers",
        value: 2
      }
    );

    assert.strictEqual(
      calls.some(
        (call) =>
          call.method === "update"
      ),
      true
    );
  }
);
test(
  "Changes the displayed skills page without changing the controller view",
  async () => {
    const {
      router,
      registryHarness,
      renderCalls,
      renderOptionsCalls
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    registryHarness
      .sessionHarness
      .session
      .submitName("Naoko");

    registryHarness
      .sessionHarness
      .session
      .moveToSkills();

    const {
      interaction
    } = createInteraction({
      customId:
        `${SKILL_PAGE_ACTION_PREFIX}1`,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "change_skills_page"
    );

    assert.strictEqual(
      result.skillPage,
      1
    );

    assert.strictEqual(
      renderCalls[
        renderCalls.length - 1
      ],
      result.view
    );

    assert.deepStrictEqual(
      renderOptionsCalls[
        renderOptionsCalls.length - 1
      ],
      {
        skillPage: 1
      }
    );

    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(
        result.view,
        "skillPage"
      ),
      false
    );
  }
);

test(
  "Preserves the displayed page after changing a skill",
  async () => {
    const {
      router,
      registryHarness,
      renderCalls,
      renderOptionsCalls
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    registryHarness
      .sessionHarness
      .session
      .submitName("Naoko");

    registryHarness
      .sessionHarness
      .session
      .moveToSkills();

    const {
      interaction
    } = createInteraction({
      customId:
        `${SKILL_ACTION_PREFIX}computers:increase:2`,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.skillPage,
      2
    );

    assert.strictEqual(
      renderCalls[
        renderCalls.length - 1
      ],
      result.view
    );

    assert.deepStrictEqual(
      renderOptionsCalls[
        renderOptionsCalls.length - 1
      ],
      {
        skillPage: 2
      }
    );

    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(
        result.view,
        "skillPage"
      ),
      false
    );
  }
);

test(
  "Cancels character creation and removes the session",
  async () => {
    const {

      router,
      registryHarness
    } = createRouterHarness();

    const identity =
      createIdentity();

    registryHarness.registry.seed(
      identity
    );

    const {

      interaction,
      calls
    } = createInteraction({
      customId:
        CHARACTER_CREATION_ACTION
          .CANCEL,

      isButton() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.strictEqual(
      result.handled,
      true
    );

    assert.strictEqual(
      result.action,
      "cancel"
    );

    assert.strictEqual(
      result.result.cancelled,
      true
    );

    assert.strictEqual(
      registryHarness.registry.has(
        identity
      ),
      false
    );

    assert.strictEqual(
      registryHarness
        .sessionHarness
        .calls.some(
          (call) =>
            call.method ===
            "cancel"
        ),
      true
    );

    const updateCall =
      calls.find(
        (call) =>
          call.method ===
          "update"
      );

    assert.deepStrictEqual(
      updateCall.payload.embeds,
      []
    );

    assert.deepStrictEqual(
      updateCall.payload.components,
      []
    );

    assert.match(
      updateCall.payload.content,
      /draft can be resumed later/i
    );
  }
);

test(
  "Returns unhandled for unrelated interactions",
  async () => {
    const {

      router
    } = createRouterHarness();

    const {

      interaction,
      calls
    } = createInteraction({
      commandName:
        "unrelated-command",

      isChatInputCommand() {
        return true;
      }
    });

    const result =
      await router.route(
        interaction
      );

    assert.deepStrictEqual(
      result,
      {
        handled: false
      }
    );

    assert.strictEqual(
      calls.length,
      0
    );
  }
);

test(
  "Rejects component interactions without an active session",
  async () => {
    const {

      router
    } = createRouterHarness();

    const {

      interaction
    } = createInteraction({
      customId:
        CHARACTER_CREATION_ACTION
          .SET_NAME,

      isButton() {
        return true;
      }
    });

    await assert.rejects(
      () =>
        router.route(
          interaction
        ),
      /No active Discord character creation session/
    );
  }
);

test(
  "Requires valid construction dependencies",
  () => {
    assert.throws(
      () =>
        createDiscordCharacterCreationRouter({
          sessionRegistry: null,
          renderView() {},
          createNameModal() {}
        }),
      /sessionRegistry must be an object/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationRouter({
          sessionRegistry: {
            getOrStart() {},
            get() {},
            remove() {}
          },
          renderView: null,
          createNameModal() {}
        }),
      /renderView must be a function/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationRouter({
          sessionRegistry: {
            getOrStart() {},
            get() {},
            remove() {}
          },
          renderView() {},
          createNameModal: null
        }),
      /createNameModal must be a function/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD CHARACTER CREATION ROUTER TESTS"
  );
  console.log(
    "================================"
  );

  let passed = 0;
  let failed = 0;

  for (const definition of tests) {
    try {
      await definition.callback();

      passed += 1;

      console.log(
        `PASS ${definition.name}`
      );
    } catch (error) {
      failed += 1;

      console.error(
        `FAIL ${definition.name}`
      );
      console.error(error);
    }
  }

  console.log(
    "================================"
  );
  console.log(`${passed} passed`);
  console.log(`${failed} failed`);
  console.log(
    "================================"
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();