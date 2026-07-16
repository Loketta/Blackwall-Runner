"use strict";

const assert = require("assert");

const {
  CHARACTER_CREATION_ACTION,
  CHARACTER_NAME_INPUT_ID,
  CREATE_CHARACTER_COMMAND,
  createDiscordCharacterCreationRouter,
  createInteractionIdentity
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
        canMovePrevious: true
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

    submitName(name) {
      calls.push({
        method: "submitName",
        name
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
  const modalCalls = [];

  function renderView(view) {
    renderCalls.push(view);

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