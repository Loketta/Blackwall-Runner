"use strict";

const assert = require("assert");

const {
  createCharacterCreationController
} = require(
  "../../src/game/characterCreation/characterCreationController"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createStartingAttributes() {
  return {
    force: 2,
    agility: 2,
    dexterity: 2,
    intellect: 2,
    awareness: 2,
    will: 2,
    face: 2
  };
}

function createStartingSkills() {
  return {
    firearms: 0,
    melee: 0,
    unarmed_combat: 0,
    grappling: 0,
    evasion: 0,
    explosives: 0,
    athletics: 0,
    acrobatics: 0,
    endurance: 0,
    stealth: 0,
    engineering: 0,
    mechanical_security: 0,
    medicine: 0,
    computers: 0,
    digital_security: 0,
    investigation: 0,
    knowledge: 0,
    science: 0,
    tactics: 0,
    perception: 0,
    tracking: 0,
    streetwise: 0,
    insight: 0,
    persuasion: 0,
    deception: 0,
    negotiation: 0,
    leadership: 0,
    performance: 0,
    networking: 0,
    intimidation: 0,
    discipline: 0,
    resolve: 0,
    survival: 0
  };
}

function createCompletedSkills() {
  const skills = createStartingSkills();

  skills.firearms = 4;
  skills.stealth = 4;
  skills.evasion = 4;
  skills.investigation = 4;
  skills.perception = 4;
  skills.insight = 4;

  return skills;
}

function createFakeApplication({
  existingName = "",
  attributes = createStartingAttributes(),
  skills = createStartingSkills(),
  profession = null
} = {}) {
  let draft = {
    id: "draft-1",
    revision: 0,
    identity: {
      name: existingName
    },
    attributes: {
      ...attributes
    },
    skills: {
      ...skills
    },
    profession
  };

  const calls = {
    startOrResume: [],
    setName: [],
    setAttribute: [],
    setSkill: [],
    setProfession: [],
    setProfessionChoice: [],
    validate: [],
    finalise: []
  };

  const application = {
    startOrResume(input) {
      calls.startOrResume.push(input);

      return {
        created: existingName.length === 0,
        draft
      };
    },

    setName(input) {
      calls.setName.push(input);

      draft = {
        ...input.draft,
        revision: input.draft.revision + 1,
        identity: {
          ...input.draft.identity,
          name: input.name
        }
      };

      return {
        draft
      };
    },

    setAttribute(input) {
      calls.setAttribute.push(input);

      draft = {
        ...input.draft,
        revision: input.draft.revision + 1,
        attributes: {
          ...input.draft.attributes,
          [input.attributeId]: input.value
        }
      };

      return {
        draft
      };
    },

    setSkill(input) {
      calls.setSkill.push(input);

      draft = {
        ...input.draft,
        revision: input.draft.revision + 1,
        skills: {
          ...input.draft.skills,
          [input.skillId]: input.value
        }
      };

      return {
        draft
      };
    },

    setProfession(input) {
      calls.setProfession.push(input);

      draft = {
        ...input.draft,
        revision: input.draft.revision + 1,
        profession: input.professionId,
        professionChoices: {}
      };

      return {
        draft
      };
    },

    setProfessionChoice(input) {
      calls.setProfessionChoice.push(input);

      draft = {
        ...input.draft,
        revision: input.draft.revision + 1,
        professionChoices: {
          ...(input.draft.professionChoices ?? {}),
          [input.choiceId]: input.value
        }
      };

      return {
        draft
      };
    },

    validate(input) {
      calls.validate.push(input);

      const attributeTotal =
        Object.values(
          input.attributes
        ).reduce(
          (total, value) =>
            total + value,
          0
        );

      const skillTotal =
        Object.values(
          input.skills
        ).reduce(
          (total, value) =>
            total + value,
          0
        );

      const errors = [];

      if (attributeTotal !== 42) {
        errors.push({
          field: "attributes",
          code: "invalid_attribute_budget",
          message:
            "Attribute budget is incomplete."
        });
      }

      if (skillTotal !== 24) {
        errors.push({
          field: "skills",
          code: "invalid_skill_budget",
          message:
            "Skill budget is incomplete."
        });
      }

      if (!input.profession) {
        errors.push({
          field: "profession",
          code: "profession_required",
          message:
            "A profession must be selected."
        });
      }

      if (
        input.profession === "operator" &&
        !input.professionChoices
          ?.weapon_type
      ) {
        errors.push({
          field:
            "professionChoices.weapon_type",
          code:
            "required_profession_choice",
          message:
            "Operator requires a weapon type."
        });
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    finalise(input) {
      calls.finalise.push(input);

      const finalisedDraft = {
        ...input.draft,
        revision: input.draft.revision + 1,
        status: "finalised"
      };

      const character = {
        id: "character-1",
        name: input.draft.identity.name,
        ownerId: "user-1",
        platform: "cli",
        attributes: {
          ...input.draft.attributes
        },
        skills: {
          ...input.draft.skills
        },
        profession: {
          id: input.draft.profession
        },
        professionChoices: {
          ...input.draft.professionChoices
        },
        location: input.startingLocation,
        credits: input.startingCredits,
        inventory: [
          ...input.startingInventory
        ]
      };

      draft = finalisedDraft;

      return {
        created: true,
        character,
        finalisedDraft
      };
    }
  };

  return {
    application,
    calls,
    getDraft: () => draft
  };
}
test("Requires a character creation application", () => {
  assert.throws(
    () =>
      createCharacterCreationController({
        application: null
      }),
    /application is required/
  );
});

test("Requires every application method it uses", () => {
  assert.throws(
    () =>
      createCharacterCreationController({
        application: {
          startOrResume() {},
          setName() {}
        }
      }),
    /requires setAttribute/
  );
});

test("Starts a character creation session", () => {
  const fake = createFakeApplication();

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  const view = controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  assert.deepStrictEqual(
    fake.calls.startOrResume,
    [
      {
        ownerId: "user-1",
        platform: "cli"
      }
    ]
  );

  assert.strictEqual(view.stage, "name");
  assert.strictEqual(
    view.title,
    "Choose Your Name"
  );
  assert.strictEqual(view.values.name, "");
  assert.strictEqual(view.created, true);
  assert.strictEqual(controller.isActive(), true);
});

test("Renders a resumed draft name", () => {
  const fake = createFakeApplication({
    existingName: "Naoko"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  const view = controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  assert.strictEqual(
    view.values.name,
    "Naoko"
  );

  assert.strictEqual(
    view.created,
    false
  );
});

test("Submits the character name through the application", () => {
  const fake = createFakeApplication();

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  const view = controller.submit({
    value: "Naoko"
  });

  assert.strictEqual(
    fake.calls.setName.length,
    1
  );

  assert.strictEqual(
    fake.calls.setName[0].expectedRevision,
    0
  );

  assert.strictEqual(
    fake.calls.setName[0].name,
    "Naoko"
  );

  assert.strictEqual(view.values.name, "Naoko");
  assert.strictEqual(view.revision, 1);
});

test("Prevents advancing without a name", () => {
  const fake = createFakeApplication();

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  assert.throws(
    () => controller.next(),
    /name is required/
  );
});

test("Renders the attribute allocation state", () => {
  const fake = createFakeApplication({
    existingName: "Naoko"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  const view = controller.next();

  assert.strictEqual(
    view.stage,
    "attributes"
  );

  assert.deepStrictEqual(
    view.values,
    createStartingAttributes()
  );

  assert.deepStrictEqual(
    view.rules,
    {
      minimum: 2,
      maximum: 8,
      totalBudget: 42
    }
  );

  assert.strictEqual(
    view.allocatedPoints,
    14
  );

  assert.strictEqual(
    view.remainingPoints,
    28
  );

  assert.strictEqual(
    view.canMoveNext,
    false
  );

  assert.deepStrictEqual(
    view.availableActions,
    [
      "set_attribute",
      "previous",
      "cancel"
    ]
  );
});

test("Submits an attribute through the application", () => {
  const fake = createFakeApplication({
    existingName: "Naoko"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();

  const view = controller.submit({
    attributeId: "force",
    value: 8
  });

  assert.strictEqual(
    fake.calls.setAttribute.length,
    1
  );

  assert.deepStrictEqual(
    fake.calls.setAttribute[0],
    {
      draft: {
        id: "draft-1",
        revision: 0,
        identity: {
          name: "Naoko"
        },
        attributes: createStartingAttributes(),
        skills: createStartingSkills(),
        profession: null
      },
      expectedRevision: 0,
      attributeId: "force",
      value: 8
    }
  );

  assert.strictEqual(view.values.force, 8);
  assert.strictEqual(view.revision, 1);
  assert.strictEqual(view.remainingPoints, 22);
});

test("Prevents advancing with unallocated attribute points", () => {
  const fake = createFakeApplication({
    existingName: "Naoko"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();

  assert.throws(
    () => controller.next(),
    /attribute points must be allocated/
  );
});

test("Allows advancing when the attribute budget is exact", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    }
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  let view = controller.next();

  assert.strictEqual(view.remainingPoints, 0);
  assert.strictEqual(view.canMoveNext, true);

  view = controller.next();

  assert.strictEqual(view.stage, "skills");
});

test("Moves back to the previous stage", () => {
  const fake = createFakeApplication({
    existingName: "Naoko"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();

  const view = controller.previous();

  assert.strictEqual(view.stage, "name");
});

test("Cancels and clears the active session", () => {
  const fake = createFakeApplication();

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  const result = controller.cancel();

  assert.deepStrictEqual(
    result,
    {
      cancelled: true,
      draftId: "draft-1",
      revision: 0
    }
  );

  assert.strictEqual(
    controller.isActive(),
    false
  );

  assert.throws(
    () => controller.renderCurrentStep(),
    /has not been started/
  );
});

test("Rejects operations before start", () => {
  const fake = createFakeApplication();

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  assert.throws(
    () => controller.next(),
    /has not been started/
  );

  assert.throws(
    () => controller.previous(),
    /has not been started/
  );

  assert.throws(
    () => controller.submit({
      value: "Naoko"
    }),
    /has not been started/
  );
});

test("Returns immutable controller and view objects", () => {
  const fake = createFakeApplication();

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  const view = controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  assert.strictEqual(
    Object.isFrozen(controller),
    true
  );

  assert.strictEqual(
    Object.isFrozen(view),
    true
  );

  assert.strictEqual(
    Object.isFrozen(view.values),
    true
  );

  assert.strictEqual(
    Object.isFrozen(view.availableActions),
    true
  );
});

test("Renders the skill allocation state", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    }
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();

  const view = controller.next();

  assert.strictEqual(view.stage, "skills");

  assert.strictEqual(
    view.title,
    "Allocate Skills"
  );

  assert.strictEqual(
    view.values.firearms,
    0
  );

  assert.strictEqual(
    view.values.intimidation,
    0
  );

  assert.strictEqual(
    view.options.length,
    33
  );

  assert.deepStrictEqual(
    view.rules,
    {
      minimum: 0,
      maximum: 4,
      totalBudget: 24,
      untrainedAllowed: true,
      untrainedRollMode: "disadvantage"
    }
  );

  assert.strictEqual(
    view.allocatedPoints,
    0
  );

  assert.strictEqual(
    view.remainingPoints,
    24
  );

  assert.strictEqual(
    view.canMoveNext,
    false
  );

  assert.deepStrictEqual(
    view.availableActions,
    [
      "set_skill",
      "previous",
      "cancel"
    ]
  );
});

test("Exposes structured skill definitions", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    }
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();

  const view = controller.next();

  const firearms = view.options.find(
    (skill) => skill.id === "firearms"
  );

  const intimidation = view.options.find(
    (skill) => skill.id === "intimidation"
  );

  assert.deepStrictEqual(
    {
      id: firearms.id,
      name: firearms.name,
      defaultAttribute:
        firearms.defaultAttribute,
      categories: firearms.categories
    },
    {
      id: "firearms",
      name: "Firearms",
      defaultAttribute: "dexterity",
      categories: [
        "combat",
        "ranged_attack"
      ]
    }
  );

  assert.deepStrictEqual(
    intimidation.alternateAttributes,
    [
      "force"
    ]
  );

  assert.strictEqual(
    Object.isFrozen(view.options),
    true
  );
});

test("Submits a skill through the application", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    }
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();

  const view = controller.submit({
    skillId: "firearms",
    value: 4
  });

  assert.strictEqual(
    fake.calls.setSkill.length,
    1
  );

  assert.strictEqual(
    fake.calls.setSkill[0].expectedRevision,
    0
  );

  assert.strictEqual(
    fake.calls.setSkill[0].skillId,
    "firearms"
  );

  assert.strictEqual(
    fake.calls.setSkill[0].value,
    4
  );

  assert.strictEqual(
    view.values.firearms,
    4
  );

  assert.strictEqual(
    view.revision,
    1
  );

  assert.strictEqual(
    view.allocatedPoints,
    4
  );

  assert.strictEqual(
    view.remainingPoints,
    20
  );
});

test("Prevents advancing with unallocated skill points", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    }
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();

  assert.throws(
    () => controller.next(),
    /skill points must be allocated/
  );
});

test("Allows advancing when the skill budget is exact", () => {
  const skills = createStartingSkills();

  skills.firearms = 4;
  skills.stealth = 4;
  skills.evasion = 4;
  skills.investigation = 4;
  skills.perception = 4;
  skills.insight = 4;

  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();

  let view = controller.next();

  assert.strictEqual(
    view.remainingPoints,
    0
  );

  assert.strictEqual(
    view.canMoveNext,
    true
  );

  assert.deepStrictEqual(
    view.availableActions,
    [
      "set_skill",
      "previous",
      "next",
      "cancel"
    ]
  );

  view = controller.next();

  assert.strictEqual(
    view.stage,
    "profession"
  );

  assert.strictEqual(
    view.title,
    "Choose a Profession"
  );
});

test("Renders profession selection options", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills()
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();

  const view = controller.next();

  assert.strictEqual(
    view.stage,
    "profession"
  );

  assert.strictEqual(
    view.values.professionId,
    null
  );

  assert.strictEqual(
    view.options.length,
    10
  );

  assert.strictEqual(
    view.options.some(
      (profession) =>
        profession.id === "operator"
    ),
    true
  );

  assert.strictEqual(
    view.canMoveNext,
    false
  );

  assert.deepStrictEqual(
    view.availableActions,
    [
      "select_profession",
      "previous",
      "cancel"
    ]
  );
});

test("Submits a profession through the application", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills()
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();

  const view = controller.submit({
    professionId: "operator"
  });

  assert.strictEqual(
    fake.calls.setProfession.length,
    1
  );

  assert.strictEqual(
    fake.calls.setProfession[0]
      .expectedRevision,
    0
  );

  assert.strictEqual(
    fake.calls.setProfession[0]
      .professionId,
    "operator"
  );

  assert.strictEqual(
    view.values.professionId,
    "operator"
  );

  assert.strictEqual(
    view.revision,
    1
  );

  assert.strictEqual(
    view.canMoveNext,
    true
  );
});

test("Prevents advancing without a profession", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills()
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();

  assert.throws(
    () => controller.next(),
    /profession must be selected/
  );
});

test("Moves professions with choices to profession choices", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();

  const view = controller.next();

  assert.strictEqual(
    view.stage,
    "profession_choices"
  );
});

test("Skips profession choices when none are required", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "melee_specialist"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();

  const view = controller.next();

  assert.strictEqual(
    view.stage,
    "review"
  );
});


test("Renders required profession choices", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();

  const view = controller.next();

  assert.strictEqual(
    view.stage,
    "profession_choices"
  );

  assert.deepStrictEqual(
    view.values,
    {}
  );

  assert.strictEqual(
    view.choices.length,
    1
  );

  assert.deepStrictEqual(
    {
      id: view.choices[0].id,
      type: view.choices[0].type,
      required: view.choices[0].required,
      minimumSelections:
        view.choices[0].minimumSelections,
      maximumSelections:
        view.choices[0].maximumSelections,
      value: view.choices[0].value
    },
    {
      id: "weapon_type",
      type: "weapon_type",
      required: true,
      minimumSelections: 1,
      maximumSelections: 1,
      value: null
    }
  );

  assert.strictEqual(
    view.canMoveNext,
    false
  );

  assert.deepStrictEqual(
    view.availableActions,
    [
      "set_profession_choice",
      "previous",
      "cancel"
    ]
  );
});

test("Exposes weapon type choice options", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();

  const view = controller.next();
  const choice = view.choices[0];

  assert.strictEqual(
    choice.options.length,
    8
  );

  assert.deepStrictEqual(
    choice.options.find(
      (option) =>
        option.id === "sniper_rifles"
    ),
    {
      id: "sniper_rifles",
      name: "Sniper Rifles",
      category: "ranged"
    }
  );

  assert.strictEqual(
    Object.isFrozen(choice.options),
    true
  );
});

test("Submits a profession choice through the application", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  const view = controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  assert.strictEqual(
    fake.calls.setProfessionChoice.length,
    1
  );

  assert.deepStrictEqual(
    {
      expectedRevision:
        fake.calls.setProfessionChoice[0]
          .expectedRevision,
      choiceId:
        fake.calls.setProfessionChoice[0]
          .choiceId,
      value:
        fake.calls.setProfessionChoice[0]
          .value
    },
    {
      expectedRevision: 0,
      choiceId: "weapon_type",
      value: "sniper_rifles"
    }
  );

  assert.strictEqual(
    view.values.weapon_type,
    "sniper_rifles"
  );

  assert.strictEqual(
    view.choices[0].value,
    "sniper_rifles"
  );

  assert.strictEqual(
    view.revision,
    1
  );

  assert.strictEqual(
    view.canMoveNext,
    true
  );
});

test("Prevents advancing without required profession choices", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  assert.throws(
    () => controller.next(),
    /required profession choices/
  );
});

test("Advances to review when profession choices are complete", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  const view = controller.next();

  assert.strictEqual(
    view.stage,
    "review"
  );

  assert.strictEqual(
    view.title,
    "Review Character"
  );
});


test("Renders a complete review summary", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  const view = controller.next();

  assert.strictEqual(
    view.stage,
    "review"
  );

  assert.strictEqual(
    view.review.identity.name,
    "Naoko"
  );

  assert.strictEqual(
    view.review.attributes.dexterity,
    7
  );

  assert.strictEqual(
    view.review.skills.firearms,
    4
  );

  assert.strictEqual(
    view.review.profession.id,
    "operator"
  );

  assert.strictEqual(
    view.review.profession.mastery.id,
    "ghost"
  );

  assert.strictEqual(
    view.review.professionChoices
      .weapon_type,
    "sniper_rifles"
  );
});

test("Exposes effective skill totals in review", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  const view = controller.next();

  assert.strictEqual(
    view.review.effectiveSkills
      .stealth.baseRank,
    4
  );

  assert.strictEqual(
    view.review.effectiveSkills
      .stealth.professionBonus,
    1
  );

  assert.strictEqual(
    view.review.effectiveSkills
      .stealth.effectiveRank,
    5
  );

  assert.strictEqual(
    view.review.effectiveSkills
      .firearms.effectiveRank,
    4
  );

  assert.strictEqual(
    typeof view.review.contextualSkillNote,
    "string"
  );
});

test("Exposes application validation in review", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  const view = controller.next();

  assert.strictEqual(
    fake.calls.validate.length,
    1
  );

  assert.deepStrictEqual(
    view.review.validation,
    {
      valid: true,
      errors: []
    }
  );

  assert.strictEqual(
    view.review.readyToFinalise,
    true
  );
});

test("Review does not advance without finalisation", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  const view = controller.next();

  assert.strictEqual(
    view.canMoveNext,
    false
  );

  assert.deepStrictEqual(
    view.availableActions,
    [
      "previous",
      "finalise",
      "cancel"
    ]
  );
});

test("Returns immutable review structures", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  const view = controller.next();

  assert.strictEqual(
    Object.isFrozen(view.review),
    true
  );

  assert.strictEqual(
    Object.isFrozen(
      view.review.attributes
    ),
    true
  );

  assert.strictEqual(
    Object.isFrozen(
      view.review.skills
    ),
    true
  );

  assert.strictEqual(
    Object.isFrozen(
      view.review.effectiveSkills
    ),
    true
  );

  assert.strictEqual(
    Object.isFrozen(
      view.review.validation
    ),
    true
  );
});


test("Exposes finalise only for a valid review", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  const view = controller.next();

  assert.deepStrictEqual(
    view.availableActions,
    [
      "previous",
      "finalise",
      "cancel"
    ]
  );
});

test("Rejects finalisation outside review", () => {
  const fake = createFakeApplication();

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  assert.throws(
    () => controller.finalise({
      startingLocation: "back_alley_1"
    }),
    /only be finalised from review/
  );
});

test("Finalises through the application", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  controller.next();

  const view = controller.finalise({
    startingLocation: "back_alley_1",
    startingCredits: 500,
    startingInventory: [
      "unity_pistol"
    ]
  });

  assert.strictEqual(
    fake.calls.finalise.length,
    1
  );

  assert.strictEqual(
    fake.calls.finalise[0]
      .expectedRevision,
    1
  );

  assert.strictEqual(
    fake.calls.finalise[0]
      .startingLocation,
    "back_alley_1"
  );

  assert.strictEqual(
    fake.calls.finalise[0]
      .startingCredits,
    500
  );

  assert.deepStrictEqual(
    fake.calls.finalise[0]
      .startingInventory,
    [
      "unity_pistol"
    ]
  );

  assert.strictEqual(
    view.stage,
    "finished"
  );
});

test("Renders the finalised character", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  controller.next();

  const view = controller.finalise({
    startingLocation: "back_alley_1"
  });

  assert.strictEqual(
    view.complete,
    true
  );

  assert.strictEqual(
    view.createdCharacter,
    true
  );

  assert.strictEqual(
    view.character.id,
    "character-1"
  );

  assert.strictEqual(
    view.character.name,
    "Naoko"
  );

  assert.deepStrictEqual(
    view.availableActions,
    []
  );

  assert.strictEqual(
    view.canMoveNext,
    false
  );

  assert.strictEqual(
    view.canMovePrevious,
    false
  );
});

test("Does not allow returning from finished", () => {
  const fake = createFakeApplication({
    existingName: "Naoko",
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    skills: createCompletedSkills(),
    profession: "operator"
  });

  const controller =
    createCharacterCreationController({
      application: fake.application
    });

  controller.start({
    ownerId: "user-1",
    platform: "cli"
  });

  controller.next();
  controller.next();
  controller.next();
  controller.next();

  controller.submit({
    choiceId: "weapon_type",
    value: "sniper_rifles"
  });

  controller.next();

  controller.finalise({
    startingLocation: "back_alley_1"
  });

  assert.throws(
    () => controller.previous(),
    /cannot return to character creation/
  );
});

async function run() {
  console.log("================================");
  console.log(
    "CHARACTER CREATION CONTROLLER TESTS"
  );
  console.log("================================");

  let passed = 0;

  for (const currentTest of tests) {
    try {
      await currentTest.callback();
      passed += 1;
      console.log(`PASS ${currentTest.name}`);
    } catch (error) {
      console.error(`FAIL ${currentTest.name}`);
      console.error(error);
      process.exitCode = 1;
    }
  }

  console.log("================================");
  console.log(`${passed} passed`);
  console.log(`${tests.length - passed} failed`);
  console.log("================================");
}

run();
