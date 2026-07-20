"use strict";

const assert = require("assert");

const {
  createDiscordCharacterCreationSession
} = require(
  "../../src/discord/characterCreation/discordCharacterCreationSession"
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

function createControllerHarness() {
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

  const updatedAttributeView =
    createView(
      "attributes",
      {
        stageNumber: 2,
        canMovePrevious: true,
        values: {
          force: 5
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

  const updatedSkillView =
    createView(
      "skills",
      {
        stageNumber: 3,
        canMovePrevious: true,
        values: {
          computers: 4
        }
      }
    );

  const professionView =
    createView(
      "profession",
      {
        stageNumber: 4,
        canMovePrevious: true,
        values: {
          professionId: null
        }
      }
    );

  const updatedProfessionView =
    createView(
      "profession",
      {
        stageNumber: 4,
        canMovePrevious: true,
        canMoveNext: true,
        values: {
          professionId: "engineer"
        }
      }
    );
  const updatedProfessionChoiceView =
    createView(
      "profession_choices",
      {
        stageNumber: 4,
        canMovePrevious: true,
        canMoveNext: true,
        values: {
          professionId: "operator",
          weaponType: "pistol"
        }
      }
    );
  const reviewView =
    createView(
      "review",
      {
        stageNumber: 6,
        canMovePrevious: true,
        review: {
          readyToFinalise: true
        }
      }
    );

  const finishedView =
    createView(
      "finished",
      {
        stageNumber: 7,
        character: {
          id: "character-1"
        }
      }
    );

  let active = false;
  let currentView = nameView;

  const calls = [];

  const controller = {
    start(input) {
      calls.push({
        method: "start",
        input
      });

      active = true;
      currentView = nameView;

      return currentView;
    },

    renderCurrentStep() {
      calls.push({
        method: "renderCurrentStep"
      });

      return currentView;
    },

    submit(input) {
      calls.push({
        method: "submit",
        input
      });

      if (
        currentView.stage ===
          "attributes" &&
        input.attributeId === "force" &&
        input.value === 5
      ) {
        currentView =
          updatedAttributeView;
      }

      if (
        currentView.stage ===
          "skills" &&
        input.skillId === "computers" &&
        input.value === 4
      ) {
        currentView =
          updatedSkillView;
      }


      if (
        currentView.stage ===
          "profession" &&
        input.professionId ===
          "engineer"
      ) {
        currentView =
          updatedProfessionView;
      }
      if (
        currentView.stage ===
          "profession_choices" &&
        input.choiceId ===
          "weaponType" &&
        input.value ===
          "pistol"
      ) {
        currentView =
          updatedProfessionChoiceView;
      }
      return currentView;
    },

    next() {
      calls.push({
        method: "next"
      });

      if (currentView.stage === "name") {
        currentView = attributeView;
      }

      return currentView;
    },

    previous() {
      calls.push({
        method: "previous"
      });

      currentView = nameView;

      return currentView;
    },

    finalise(input) {
      calls.push({
        method: "finalise",
        input
      });

      currentView = finishedView;

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
      calls.push({
        method: "isActive"
      });

      return active;
    }
  };

  return {
    calls,
    controller,
    views: {
      nameView,
      attributeView,
      updatedAttributeView,
      skillView,
      updatedSkillView,
      professionView,
      updatedProfessionView,

      updatedProfessionChoiceView,
      reviewView,
      finishedView
    },

    moveToSkills() {
      currentView = skillView;
    },
    moveToProfession() {
      currentView = professionView;
    },
    moveToProfessionChoices() {
      currentView = createView(
        "profession_choices",
        {
          stageNumber: 5,
          canMovePrevious: true,
          values: {
            professionId: "operator",
            weaponType: null
          }
        }
      );
    },
    moveToReview() {
      currentView = reviewView;
    }
  };
}

function createSessionHarness() {
  const controllerHarness =
    createControllerHarness();

  const application = {};

  const session =
    createDiscordCharacterCreationSession({
      application,
      startingLocation: "back_alley_1",
      startingCredits: 100,
      startingInventory: [
        "starter_item"
      ],

      createController(input) {
        assert.strictEqual(
          input.application,
          application
        );

        return controllerHarness.controller;
      }
    });

  return {
    session,
    controllerHarness
  };
}

test(
  "Starts a Discord character creation session",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    const view = session.start({
      ownerId: "discord-user-1"
    });

    assert.strictEqual(
      view.stage,
      "name"
    );

    assert.deepStrictEqual(
      controllerHarness.calls[0],
      {
        method: "start",
        input: {
          ownerId: "discord-user-1",
          platform: "discord"
        }
      }
    );

    assert.deepStrictEqual(
      session.getIdentity(),
      {
        ownerId: "discord-user-1",
        platform: "discord"
      }
    );
  }
);

test(
  "Returns the current controller view",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    const view =
      session.getCurrentView();

    assert.strictEqual(
      view.stage,
      "name"
    );

    assert.strictEqual(
      controllerHarness.calls.some(
        (call) =>
          call.method ===
          "renderCurrentStep"
      ),
      true
    );
  }
);

test(
  "Submits a name and advances",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    const view =
      session.submitName("Naoko");

    assert.strictEqual(
      view.stage,
      "attributes"
    );

    const submitCall =
      controllerHarness.calls.find(
        (call) =>
          call.method === "submit"
      );

    assert.deepStrictEqual(
      submitCall.input,
      {
        value: "Naoko"
      }
    );

    assert.strictEqual(
      controllerHarness.calls.some(
        (call) =>
          call.method === "next"
      ),
      true
    );
  }
);

test(
  "Rejects blank names",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    assert.throws(
      () => session.submitName("   "),
      /name must be a non-empty string/
    );
  }
);

test(
  "Rejects name submission outside the name stage",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    session.submitName("Naoko");

    assert.throws(
      () =>
        session.submitName("Second Name"),
      /only be submitted during the name stage/
    );
  }
);

test(
  "Updates an attribute through the controller",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    session.submitName("Naoko");

    const view =
      session.setAttribute({
        attributeId: "force",
        value: 5
      });

    assert.strictEqual(
      view.stage,
      "attributes"
    );

    assert.strictEqual(
      view.values.force,
      5
    );

    const submitCall =
      controllerHarness.calls.find(
        (call) =>
          call.method === "submit" &&
          call.input.attributeId ===
            "force"
      );

    assert.deepStrictEqual(
      submitCall,
      {
        method: "submit",
        input: {
          attributeId: "force",
          value: 5
        }
      }
    );
  }
);

test(
  "Rejects attribute updates outside the attributes stage",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    assert.throws(
      () =>
        session.setAttribute({
          attributeId: "force",
          value: 5
        }),
      /only be updated during the attributes stage/
    );
  }
);

test(
  "Requires valid attribute update input",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    session.submitName("Naoko");

    assert.throws(
      () =>
        session.setAttribute({
          attributeId: "",
          value: 5
        }),
      /attributeId must be a non-empty string/
    );

    assert.throws(
      () =>
        session.setAttribute({
          attributeId: "force",
          value: 5.5
        }),
      /value must be an integer/
    );
  }
);
test(
  "Updates a skill through the controller",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToSkills();

    session.getCurrentView();

    const view =
      session.setSkill({
        skillId: "computers",
        value: 4
      });

    assert.strictEqual(
      view.stage,
      "skills"
    );

    assert.strictEqual(
      view.values.computers,
      4
    );

    const submitCall =
      controllerHarness.calls.find(
        (call) =>
          call.method === "submit" &&
          call.input.skillId ===
            "computers"
      );

    assert.deepStrictEqual(
      submitCall,
      {
        method: "submit",
        input: {
          skillId: "computers",
          value: 4
        }
      }
    );
  }
);

test(
  "Rejects skill updates outside the skills stage",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    assert.throws(
      () =>
        session.setSkill({
          skillId: "computers",
          value: 4
        }),
      /only be updated during the skills stage/
    );
  }
);

test(
  "Requires valid skill update input",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToSkills();

    session.getCurrentView();

    assert.throws(
      () =>
        session.setSkill({
          skillId: "",
          value: 4
        }),
      /skillId must be a non-empty string/
    );

    assert.throws(
      () =>
        session.setSkill({
          skillId: "computers",
          value: 4.5
        }),
      /value must be an integer/
    );
  }
);
test(
  "Updates a profession through the controller",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToProfession();

    session.getCurrentView();

    const view =
      session.setProfession({
        professionId: "engineer"
      });

    assert.strictEqual(
      view.stage,
      "profession"
    );

    assert.strictEqual(
      view.values.professionId,
      "engineer"
    );

    const submitCall =
      controllerHarness.calls.find(
        (call) =>
          call.method === "submit" &&
          call.input.professionId ===
            "engineer"
      );

    assert.deepStrictEqual(
      submitCall,
      {
        method: "submit",
        input: {
          professionId: "engineer"
        }
      }
    );
  }
);

test(
  "Rejects profession updates outside the profession stage",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    assert.throws(
      () =>
        session.setProfession({
          professionId: "engineer"
        }),
      /only be updated during the profession stage/
    );
  }
);

test(
  "Requires valid profession update input",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToProfession();

    session.getCurrentView();

    assert.throws(
      () =>
        session.setProfession({
          professionId: ""
        }),
      /professionId must be a non-empty string/
    );

    assert.throws(
      () =>
        session.setProfession({
          professionId: "   "
        }),
      /professionId must be a non-empty string/
    );
  }
);
test(
  "Updates a profession choice through the controller",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToProfessionChoices();

    session.getCurrentView();

    const view =
      session.setProfessionChoice({
        choiceId: "weaponType",
        value: "pistol"
      });

    assert.strictEqual(
      view.stage,
      "profession_choices"
    );

    assert.strictEqual(
      view.values.weaponType,
      "pistol"
    );

    const submitCall =
      controllerHarness.calls.find(
        (call) =>
          call.method === "submit" &&
          call.input.choiceId ===
            "weaponType"
      );

    assert.deepStrictEqual(
      submitCall,
      {
        method: "submit",
        input: {
          choiceId: "weaponType",
          value: "pistol"
        }
      }
    );
  }
);

test(
  "Rejects profession choice updates outside the profession choices stage",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    assert.throws(
      () =>
        session.setProfessionChoice({
          choiceId: "weaponType",
          value: "pistol"
        }),
      /only be updated during the profession choices stage/
    );
  }
);

test(
  "Requires a valid profession choice ID",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToProfessionChoices();

    session.getCurrentView();

    assert.throws(
      () =>
        session.setProfessionChoice({
          choiceId: "",
          value: "pistol"
        }),
      /choiceId must be a non-empty string/
    );

    assert.throws(
      () =>
        session.setProfessionChoice({
          choiceId: "   ",
          value: "pistol"
        }),
      /choiceId must be a non-empty string/
    );
  }
);

test(
  "Requires a valid profession choice value",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToProfessionChoices();

    session.getCurrentView();

    assert.throws(
      () =>
        session.setProfessionChoice({
          choiceId: "weaponType",
          value: ""
        }),
      /value must be a non-empty string/
    );

    assert.throws(
      () =>
        session.setProfessionChoice({
          choiceId: "weaponType",
          value: "   "
        }),
      /value must be a non-empty string/
    );
  }
);
test(
  "Finalises with configured starting state",
  () => {
    const {
      session,
      controllerHarness
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    controllerHarness.moveToReview();

    session.getCurrentView();

    const view = session.finalise();

    assert.strictEqual(
      view.stage,
      "finished"
    );

    const finaliseCall =
      controllerHarness.calls.find(
        (call) =>
          call.method === "finalise"
      );

    assert.strictEqual(
      finaliseCall.input.startingLocation,
      "back_alley_1"
    );

    assert.strictEqual(
      finaliseCall.input.startingCredits,
      100
    );

    assert.deepStrictEqual(
      finaliseCall.input.startingInventory,
      [
        "starter_item"
      ]
    );
  }
);

test(
  "Cancels and clears the session",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    const result = session.cancel();

    assert.strictEqual(
      result.cancelled,
      true
    );

    assert.strictEqual(
      session.isActive(),
      false
    );

    assert.throws(
      () => session.getCurrentView(),
      /session has not started/
    );
  }
);

test(
  "Prevents use before the session starts",
  () => {
    const {
      session
    } = createSessionHarness();

    assert.throws(
      () => session.getCurrentView(),
      /session has not started/
    );

    assert.throws(
      () => session.next(),
      /session has not started/
    );

    assert.throws(
      () => session.cancel(),
      /session has not started/
    );
  }
);

test(
  "Prevents starting the same session twice",
  () => {
    const {
      session
    } = createSessionHarness();

    session.start({
      ownerId: "discord-user-1"
    });

    assert.throws(
      () =>
        session.start({
          ownerId: "discord-user-1"
        }),
      /already started/
    );
  }
);

test(
  "Requires valid construction dependencies",
  () => {
    assert.throws(
      () =>
        createDiscordCharacterCreationSession({
          application: null,
          startingLocation: "back_alley_1"
        }),
      /application must be an object/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationSession({
          application: {},
          startingLocation: ""
        }),
      /startingLocation must be a non-empty string/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationSession({
          application: {},
          startingLocation: "back_alley_1",
          createController: null
        }),
      /createController must be a function/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD CHARACTER CREATION SESSION TESTS"
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
