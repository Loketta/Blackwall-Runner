"use strict";

const assert = require("assert");

const {
  ButtonStyle,
  ComponentType,
  TextInputStyle
} = require("discord.js");

const {
  DISCORD_CHARACTER_CREATION_ACTION,
  createDiscordCharacterCreationPayload,
  createNameModal
} = require(
  "../../src/discord/characterCreation/discordCharacterCreationView"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createNameView({
  name = ""
} = {}) {
  return {
    stage: "name",
    stageNumber: 1,
    stageCount: 7,
    title: "Choose Your Name",
    description:
      "Enter the name your character will use.",
    values: {
      name
    },
    actions: [
      "submit_name",
      "cancel"
    ],
    canMoveNext: false,
    canMovePrevious: false
  };
}

function createAttributesView({
  values = {
    force: 5,
    agility: 4,
    dexterity: 4,
    intellect: 6,
    awareness: 4,
    will: 5,
    face: 3
  },
  allocatedPoints = 31,
  remainingPoints = 11
} = {}) {
  return {
    stage: "attributes",
    stageNumber: 2,
    stageCount: 7,
    title: "Allocate Attributes",
    description:
      "Distribute points between your core attributes.",
    values,
    rules: {
      minimum: 2,
      maximum: 8,
      totalBudget: 42
    },
    allocatedPoints,
    remainingPoints,
    actions: [
      "set_attribute",
      "move_previous",
      "cancel"
    ],
    canMoveNext: false,
    canMovePrevious: true
  };
}
function createSkillsView({
  values = {
    athletics: 2,
    computers: 4,
    deduction: 3,
    explosives: 1,
    grapple: 0,
    insight: 2,
    intimidation: 1,
    investigation: 3,
    leadership: 0,
    medicine: 2,
    negotiation: 1,
    perception: 3,
    stealth: 4,
    streetwise: 2,
    tactics: 1
  },
  allocatedPoints = 29,
  remainingPoints = -5
} = {}) {
  return {
    stage: "skills",
    stageNumber: 3,
    stageCount: 7,
    title: "Allocate Skills",
    description:
      "Distribute points between your skills.",
    values,
    options:
      Object.keys(values).map(
        (skillId) => ({
          id: skillId,
          name: skillId
            .split("_")
            .map(
              (part) =>
                part[0].toUpperCase() +
                part.slice(1)
            )
            .join(" ")
        })
      ),
    rules: {
      minimum: 0,
      maximum: 4,
      totalBudget: 24,
      untrainedAllowed: true,
      untrainedRollMode:
        "roll_twice_take_lower"
    },
    allocatedPoints,
    remainingPoints,
    actions: [
      "set_skill",
      "move_previous",
      "cancel"
    ],
    canMoveNext: false,
    canMovePrevious: true
  };
}
function createProfessionView({
  professionId = null,
  options = [
    {
      id: "melee_specialist",
      name: "Melee Specialist",
      status: "available",
      aptitudes: [
        "+1 melee checks per level",
        "+2 Endurance per level"
      ],
      mastery: {
        name: "Monstrous",
        description:
          "Exceptional close-combat power."
      }
    },
    {
      id: "hacker",
      name: "Hacker",
      status: "available",
      aptitudes: [
        "+1 Computers",
        "+1 Digital Security"
      ],
      mastery: {
        name: "Hijack",
        description:
          "Control connected systems through an access point."
      }
    }
  ]
} = {}) {
  return {
    stage: "profession",
    stageNumber: 4,
    stageCount: 7,
    title: "Choose a Profession",
    description:
      "Select your character's profession.",
    values: {
      professionId
    },
    options,
    actions: [
      "select_profession",
      "move_previous",
      "cancel"
    ],
    canMoveNext:
      professionId !== null,
    canMovePrevious: true
  };
}

function createProfessionChoicesView({
  value = null
} = {}) {
  return {
    stage: "profession_choices",
    stageNumber: 5,
    stageCount: 7,
    title: "Profession Choices",
    description:
      "Complete the choices required by your profession.",
    values: {
      weapon_type: value
    },
    choices: [
      {
        id: "weapon_type",
        type: "weapon_type",
        required: true,
        minimumSelections: 1,
        maximumSelections: 1,
        value,
        options: [
          {
            id: "assault_rifle",
            name: "Assault Rifle"
          },
          {
            id: "pistol",
            name: "Pistol"
          },
          {
            id: "shotgun",
            name: "Shotgun"
          }
        ]
      }
    ]
  };
}

function createReviewView({
  readyToFinalise = true,
  errors = []
} = {}) {
  return {
    stage: "review",
    stageNumber: 6,
    stageCount: 7,
    title: "Review Character",
    description:
      "Review the completed character before finalisation.",
    review: {
      identity: {
        name: "Naoko"
      },
      attributes: {
        force: 6,
        agility: 6,
        dexterity: 6,
        intellect: 6,
        awareness: 6,
        will: 6,
        face: 6
      },
      skills: {
        computers: 4,
        stealth: 4,
        medicine: 2
      },
      effectiveSkills: {
        computers: 5,
        stealth: 5,
        medicine: 2
      },
      profession: {
        id: "operator",
        name: "Operator",
        mastery: {
          name: "Ghost",
          description:
            "Automatically hit unaware targets."
        }
      },
      professionChoices: {
        weapon_type:
          "assault_rifle"
      },
      validation: {
        valid: readyToFinalise,
        errors
      },
      readyToFinalise,
      contextualSkillNote:
        "Context-dependent bonuses are applied when resolving checks."
    }
  };
}

function createFinishedView({
  character = {
    id:
      "character-123",
    worldId:
      "development-world",
    identity: {
      name: "Naoko"
    },
    professionId:
      "operator"
  },
  createdCharacter = true
} = {}) {
  return {
    stage: "finished",
    stageNumber: 7,
    stageCount: 7,
    title: "Character Complete",
    description:
      "Character creation is complete.",
    values: {},
    character,
    createdCharacter,
    complete: true,
    canMoveNext: false,
    canMovePrevious: false,
    availableActions: []
  };
}
function assertButton(
  button,
  {
    customId,
    label,
    style
  }
) {
  assert.strictEqual(
    button.type,
    ComponentType.Button
  );

  assert.strictEqual(
    button.custom_id,
    customId
  );

  assert.strictEqual(
    button.label,
    label
  );

  assert.strictEqual(
    button.style,
    style
  );
}

test(
  "Renders the Discord name stage",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createNameView()
      );

    assert.strictEqual(
      payload.embeds.length,
      1
    );

    const embed = payload.embeds[0];

    assert.strictEqual(
      embed.title,
      "Choose Your Name"
    );

    assert.match(
      embed.description,
      /Use \*\*Set Name\*\*/
    );

    assert.strictEqual(
      embed.footer.text,
      "Blackwall Runner • Step 1 of 7"
    );

    assert.strictEqual(
      embed.fields.length,
      1
    );

    assert.strictEqual(
      embed.fields[0].name,
      "Current name"
    );

    assert.strictEqual(
      embed.fields[0].value,
      "Not entered"
    );

    assert.strictEqual(
      embed.fields[0].inline,
      false
    );
  }
);

test(
  "Renders the current character name",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createNameView({
          name: "Naoko"
        })
      );

    assert.strictEqual(
      payload.embeds[0].fields[0].value,
      "Naoko"
    );
  }
);

test(
  "Renders Set Name and Save and Exit buttons",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createNameView()
      );

    assert.strictEqual(
      payload.components.length,
      1
    );

    const row = payload.components[0];

    assert.strictEqual(
      row.type,
      ComponentType.ActionRow
    );

    assert.strictEqual(
      row.components.length,
      2
    );

    assertButton(
      row.components[0],
      {
        customId:
          DISCORD_CHARACTER_CREATION_ACTION.SET_NAME,
        label: "Set Name",
        style: ButtonStyle.Primary
      }
    );

    assertButton(
      row.components[1],
      {
        customId:
          DISCORD_CHARACTER_CREATION_ACTION.CANCEL,
        label: "Save and Exit",
        style: ButtonStyle.Secondary
      }
    );
  }
);

test(
  "Creates a name-entry modal",
  () => {
    const modal = createNameModal(
      createNameView()
    );

    assert.strictEqual(
      modal.custom_id,
      DISCORD_CHARACTER_CREATION_ACTION.SUBMIT_NAME
    );

    assert.strictEqual(
      modal.title,
      "Choose Your Name"
    );

    assert.strictEqual(
      modal.components.length,
      1
    );

    const row = modal.components[0];

    assert.strictEqual(
      row.type,
      ComponentType.ActionRow
    );

    assert.strictEqual(
      row.components.length,
      1
    );

    const input = row.components[0];

    assert.strictEqual(
      input.type,
      ComponentType.TextInput
    );

    assert.strictEqual(
      input.custom_id,
      "character_name"
    );

    assert.strictEqual(
      input.label,
      "Character name"
    );

    assert.strictEqual(
      input.style,
      TextInputStyle.Short
    );

    assert.strictEqual(
      input.required,
      true
    );

    assert.strictEqual(
      input.min_length,
      1
    );

    assert.strictEqual(
      input.max_length,
      80
    );
  }
);

test(
  "Prefills the current name in the modal",
  () => {
    const modal = createNameModal(
      createNameView({
        name: "Naoko"
      })
    );

    assert.strictEqual(
      modal.components[0]
        .components[0]
        .value,
      "Naoko"
    );
  }
);

test(
  "Renders the Discord attributes stage",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createAttributesView()
      );

    assert.strictEqual(
      payload.embeds.length,
      1
    );

    const embed = payload.embeds[0];

    assert.strictEqual(
      embed.title,
      "Allocate Attributes"
    );

    assert.match(
      embed.footer.text,
      /Step 2 of 7$/
    );

    assert.strictEqual(
      embed.fields.length,
      2
    );

    assert.strictEqual(
      embed.fields[0].name,
      "Allocation"
    );

    assert.match(
      embed.fields[0].value,
      /Allocated.*31.*42/
    );

    assert.match(
      embed.fields[0].value,
      /Remaining.*11/
    );

    assert.match(
      embed.fields[0].value,
      /Minimum.*2/
    );

    assert.match(
      embed.fields[0].value,
      /Maximum.*8/
    );

    assert.strictEqual(
      embed.fields[1].name,
      "Current Attributes"
    );

    assert.match(
      embed.fields[1].value,
      /Force.*5/
    );

    assert.match(
      embed.fields[1].value,
      /Intellect.*6/
    );

    assert.match(
      embed.fields[1].value,
      /Face.*3/
    );

    assert.strictEqual(
      payload.components.length,
      4
    );

    const allButtons =
      payload.components.flatMap(
        (row) => row.components
      );

    const forceDecrease =
      allButtons.find(
        (button) =>
          button.custom_id ===
          "character_creation:attribute:force:decrease"
      );

    const forceIncrease =
      allButtons.find(
        (button) =>
          button.custom_id ===
          "character_creation:attribute:force:increase"
      );

    assert.ok(forceDecrease);
    assert.ok(forceIncrease);

    assert.strictEqual(
      forceDecrease.label,
      "- Force"
    );

    assert.strictEqual(
      forceIncrease.label,
      "+ Force"
    );

    assert.strictEqual(
      forceDecrease.disabled,
      false
    );

    assert.strictEqual(
      forceIncrease.disabled,
      false
    );

    const navigationRow =
      payload.components[
        payload.components.length - 1
      ];

    assert.strictEqual(
      navigationRow.components.length,
      3
    );

    assert.strictEqual(
      navigationRow.components[0].custom_id,
      DISCORD_CHARACTER_CREATION_ACTION.PREVIOUS
    );

    assert.strictEqual(
      navigationRow.components[0].disabled,
      false
    );

    assert.strictEqual(
      navigationRow.components[1].custom_id,
      DISCORD_CHARACTER_CREATION_ACTION.NEXT
    );

    assert.strictEqual(
      navigationRow.components[1].disabled,
      true
    );

    assert.strictEqual(
      navigationRow.components[2].custom_id,
      DISCORD_CHARACTER_CREATION_ACTION.CANCEL
    );
  }
);
test(
  "Disables attribute controls at allocation limits",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createAttributesView({
          values: {
            force: 2,
            agility: 8
          },
          allocatedPoints: 42,
          remainingPoints: 0
        })
      );

    const buttons =
      payload.components.flatMap(
        (row) => row.components
      );

    const forceDecrease =
      buttons.find(
        (button) =>
          button.custom_id ===
          "character_creation:attribute:force:decrease"
      );

    const forceIncrease =
      buttons.find(
        (button) =>
          button.custom_id ===
          "character_creation:attribute:force:increase"
      );

    const agilityDecrease =
      buttons.find(
        (button) =>
          button.custom_id ===
          "character_creation:attribute:agility:decrease"
      );

    const agilityIncrease =
      buttons.find(
        (button) =>
          button.custom_id ===
          "character_creation:attribute:agility:increase"
      );

    assert.strictEqual(
      forceDecrease.disabled,
      true
    );

    assert.strictEqual(
      forceIncrease.disabled,
      true
    );

    assert.strictEqual(
      agilityDecrease.disabled,
      false
    );

    assert.strictEqual(
      agilityIncrease.disabled,
      true
    );
  }
);
test(
  "Handles an attributes view with no values",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createAttributesView({
          values: {}
        })
      );

    assert.strictEqual(
      payload.embeds[0].fields[1].value,
      "No attribute values available."
    );
  }
);
test(
  "Renders the Discord skills stage",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createSkillsView()
      );

    assert.strictEqual(
      payload.embeds.length,
      1
    );

    const embed = payload.embeds[0];

    assert.strictEqual(
      embed.title,
      "Allocate Skills"
    );

    assert.match(
      embed.footer.text,
      /Step 3 of 7$/
    );

    assert.ok(
      Array.isArray(embed.fields)
    );

    assert.ok(
      embed.fields.length >= 2
    );

    const allocationField =
      embed.fields.find(
        (field) =>
          field.name === "Allocation"
      );

    assert.ok(allocationField);

    assert.match(
      allocationField.value,
      /Allocated.*29.*24/
    );

    assert.match(
      allocationField.value,
      /Remaining.*-5/
    );

    assert.match(
      allocationField.value,
      /Minimum.*0/
    );

    assert.match(
      allocationField.value,
      /Maximum.*4/
    );

    assert.match(
      allocationField.value,
      /Untrained Allowed.*Yes/
    );

    const skillsText =
      embed.fields
        .filter(
          (field) =>
            field.name.startsWith(
              "Current Skills"
            )
        )
        .map((field) => field.value)
        .join("\n");

    assert.match(
      skillsText,
      /Computers.*4/
    );

    assert.match(
      skillsText,
      /Stealth.*4/
    );

    assert.match(
      skillsText,
      /Medicine.*2/
    );

    assert.strictEqual(
      payload.components.length,
      5
    );

    const buttons =
      payload.components.flatMap(
        (row) => row.components
      );

    assert.ok(
      buttons.some(
        (button) =>
          button.custom_id ===
          "character_creation:skill:athletics:decrease:0"
      )
    );

    assert.ok(
      buttons.some(
        (button) =>
          button.custom_id ===
          "character_creation:skill:computers:increase:0"
      )
    );

    assert.ok(
      buttons.some(
        (button) =>
          button.custom_id ===
          "character_creation:skills_page:1"
      )
    );
  }
);

test(
  "Renders a requested skills page through presentation options",
  () => {
    const view =
      createSkillsView();

    const payload =
      createDiscordCharacterCreationPayload(
        view,
        {
          skillPage: 1
        }
      );

    const buttons =
      payload.components.flatMap(
        (row) => row.components
      );

    assert.ok(
      buttons.some(
        (button) =>
          button.custom_id ===
          "character_creation:skill:leadership:decrease:1"
      )
    );

    assert.ok(
      buttons.some(
        (button) =>
          button.custom_id ===
          "character_creation:skill:tactics:increase:1"
      )
    );

    assert.strictEqual(
      buttons.some(
        (button) =>
          button.custom_id.includes(
            ":athletics:"
          )
      ),
      false
    );

    const previousPage =
      buttons.find(
        (button) =>
          button.custom_id ===
          "character_creation:skills_page:0"
      );

    const nextPage =
      buttons.find(
        (button) =>
          button.custom_id ===
          "character_creation:skills_page:1"
      );

    assert.ok(previousPage);
    assert.ok(nextPage);

    assert.strictEqual(
      previousPage.disabled,
      false
    );

    assert.strictEqual(
      nextPage.disabled,
      true
    );

    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(
        view,
        "skillPage"
      ),
      false
    );
  }
);

test(
  "Splits long skill lists across fields",
  () => {
    const values = {};

    for (
      let index = 1;
      index <= 33;
      index += 1
    ) {
      values[`skill_${index}`] =
        index % 5;
    }

    const payload =
      createDiscordCharacterCreationPayload(
        createSkillsView({
          values
        })
      );

    const skillFields =
      payload.embeds[0].fields.filter(
        (field) =>
          field.name.startsWith(
            "Current Skills"
          )
      );

    assert.strictEqual(
      skillFields.length,
      3
    );

    assert.ok(
      skillFields.every(
        (field) =>
          field.value.length <= 1024
      )
    );
  }
);

test(
  "Handles a skills view with no values",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createSkillsView({
          values: {}
        })
      );

    const skillsField =
      payload.embeds[0].fields.find(
        (field) =>
          field.name ===
          "Current Skills"
      );

    assert.ok(skillsField);

    assert.strictEqual(
      skillsField.value,
      "No skill values available."
    );
  }
);
test(
  "Renders the Discord profession stage",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createProfessionView()
      );

    assert.strictEqual(
      payload.embeds.length,
      1
    );

    const embed = payload.embeds[0];

    assert.strictEqual(
      embed.title,
      "Choose a Profession"
    );

    assert.match(
      embed.footer.text,
      /Step 4 of 7$/
    );

    const currentField =
      embed.fields.find(
        (field) =>
          field.name ===
          "Current Profession"
      );

    assert.ok(currentField);

    assert.strictEqual(
      currentField.value,
      "Not selected"
    );

    const meleeField =
      embed.fields.find(
        (field) =>
          field.name ===
          "Melee Specialist"
      );

    assert.ok(meleeField);

    assert.match(
      meleeField.value,
      /Aptitudes/
    );

    assert.match(
      meleeField.value,
      /Endurance/
    );

    assert.match(
      meleeField.value,
      /Mastery/
    );

    assert.match(
      meleeField.value,
      /Monstrous/
    );

    const hackerField =
      embed.fields.find(
        (field) =>
          field.name === "Hacker"
      );

    assert.ok(hackerField);

    assert.match(
      hackerField.value,
      /Hijack/
    );
    assert.strictEqual(
      payload.components.length,
      1
    );

    const professionRow =
      payload.components[0];

    assert.strictEqual(
      professionRow.type,
      ComponentType.ActionRow
    );

    assert.strictEqual(
      professionRow.components.length,
      1
    );

    const professionMenu =
      professionRow.components[0];

    assert.strictEqual(
      professionMenu.type,
      ComponentType.StringSelect
    );

    assert.strictEqual(
      professionMenu.custom_id,
      DISCORD_CHARACTER_CREATION_ACTION
        .SELECT_PROFESSION
    );

    assert.strictEqual(
      professionMenu.min_values,
      1
    );

    assert.strictEqual(
      professionMenu.max_values,
      1
    );

    assert.ok(
      professionMenu.options.some(
        (option) =>
          option.value ===
            "melee_specialist"
      )
    );

    assert.ok(
      professionMenu.options.some(
        (option) =>
          option.value ===
            "hacker"
      )
    );

    assert.strictEqual(
      professionMenu.options.some(
        (option) =>
          option.default === true
      ),
      false
    );
  }
);

test(
  "Marks the selected profession",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createProfessionView({
          professionId: "hacker"
        })
      );

    const embed = payload.embeds[0];

    const currentField =
      embed.fields.find(
        (field) =>
          field.name ===
          "Current Profession"
      );

    assert.strictEqual(
      currentField.value,
      "Hacker"
    );

    assert.ok(
      embed.fields.some(
        (field) =>
          field.name ===
          "Hacker — Selected"
      )
    );
    const professionMenu =
      payload.components[0]
        .components[0];

    const selectedMenuOption =
      professionMenu.options.find(
        (option) =>
          option.value === "hacker"
      );

    assert.ok(selectedMenuOption);

    assert.strictEqual(
      selectedMenuOption.default,
      true
    );

    assert.strictEqual(
      professionMenu.options.filter(
        (option) =>
          option.default === true
      ).length,
      1
    );}
);

test(
  "Handles a profession view with no options",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createProfessionView({
          options: []
        })
      );

    const field =
      payload.embeds[0].fields.find(
        (entry) =>
          entry.name ===
          "Available Professions"
      );

    assert.ok(field);

    assert.strictEqual(
      field.value,
      "No profession options available."
    );
  }
);

test(
  "Keeps profession fields within Discord limits",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createProfessionView({
          options: [
            {
              id: "long_profession",
              name: "Long Profession",
              aptitudes:
                "A".repeat(1500),
              mastery:
                "B".repeat(1500)
            }
          ]
        })
      );

    const field =
      payload.embeds[0].fields.find(
        (entry) =>
          entry.name ===
          "Long Profession"
      );

    assert.ok(field);

    assert.ok(
      field.value.length <= 1024
    );
  }
);

test(
  "Renders the Discord profession choices stage",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createProfessionChoicesView()
      );

    const embed =
      payload.embeds[0];

    assert.strictEqual(
      embed.title,
      "Profession Choices"
    );

    assert.match(
      embed.footer.text,
      /Step 5 of 7$/
    );

    assert.ok(
      embed.fields.some(
        (field) =>
          /weapon type/i.test(
            field.name
          )
      )
    );

    assert.match(
      embed.fields[0].value,
      /Required/
    );

    assert.match(
      embed.fields[0].value,
      /Assault Rifle/
    );

    assert.match(
      embed.fields[0].value,
      /Shotgun/
    );

    assert.strictEqual(
      payload.components.length,
      1
    );

    const professionChoiceMenu =
      payload.components[0].components[0];

    assert.strictEqual(
      professionChoiceMenu.custom_id,
      "character_creation:profession_choice:weapon_type"
    );

    assert.strictEqual(
      professionChoiceMenu.min_values,
      1
    );

    assert.strictEqual(
      professionChoiceMenu.max_values,
      1
    );

    assert.strictEqual(
      professionChoiceMenu.options.length,
      3
    );
  }
);

test(
  "Renders the Discord review stage",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createReviewView()
      );

    const embed =
      payload.embeds[0];

    assert.strictEqual(
      embed.title,
      "Review Character"
    );

    assert.match(
      embed.footer.text,
      /Step 6 of 7$/
    );

    const allText =
      embed.fields
        .map(
          (field) =>
            `${field.name}\n${field.value}`
        )
        .join("\n");

    assert.match(
      allText,
      /Naoko/
    );

    assert.match(
      allText,
      /Force.*6/
    );

    assert.match(
      allText,
      /Computers.*4/
    );

    assert.match(
      allText,
      /Operator/
    );

    assert.match(
      allText,
      /Ghost/
    );

    assert.match(
      allText,
      /Assault Rifle/i
    );

    assert.match(
      allText,
      /Ready to Finalise.*Yes/
    );

    assert.deepStrictEqual(
      payload.components,
      []
    );
  }
);

test(
  "Renders review validation errors",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createReviewView({
          readyToFinalise: false,
          errors: [
            "All skill points must be allocated."
          ]
        })
      );

    const validation =
      payload.embeds[0]
        .fields.find(
          (field) =>
            field.name === "Validation"
        );

    assert.ok(validation);

    assert.match(
      validation.value,
      /Ready to Finalise.*No/
    );

    assert.match(
      validation.value,
      /skill points/
    );
  }
);

test(
  "Renders the Discord finished stage",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createFinishedView()
      );

    const embed =
      payload.embeds[0];

    assert.strictEqual(
      embed.title,
      "Character Complete"
    );

    assert.match(
      embed.footer.text,
      /Step 7 of 7$/
    );

    const allText =
      embed.fields
        .map(
          (field) =>
            `${field.name}\n${field.value}`
        )
        .join("\n");

    assert.match(
      allText,
      /Character Created/
    );

    assert.match(
      allText,
      /Naoko/
    );

    assert.match(
      allText,
      /character-123/
    );

    assert.match(
      allText,
      /development-world/
    );

    assert.match(
      allText,
      /Operator/
    );

    assert.deepStrictEqual(
      payload.components,
      []
    );
  }
);

test(
  "Renders an existing finalised character",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createFinishedView({
          createdCharacter: false
        })
      );

    assert.strictEqual(
      payload.embeds[0]
        .fields[0]
        .name,
      "Existing Character"
    );
  }
);

test(
  "Handles a finished view without a character",
  () => {
    const payload =
      createDiscordCharacterCreationPayload(
        createFinishedView({
          character: null
        })
      );

    assert.match(
      payload.embeds[0]
        .fields[0]
        .value,
      /no character record/i
    );
  }
);
test(
  "Rejects unsupported payload stages",
  () => {
    assert.throws(
      () =>
        createDiscordCharacterCreationPayload({
          stage: "unknown_stage"
        }),
      /Discord rendering is not implemented/
    );
  }
);

test(
  "Rejects the name modal outside the name stage",
  () => {
    assert.throws(
      () =>
        createNameModal({
          stage: "attributes"
        }),
      /only available during the name stage/
    );
  }
);

test(
  "Rejects invalid views",
  () => {
    assert.throws(
      () =>
        createDiscordCharacterCreationPayload(
          null
        ),
      /view must be an object/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationPayload(
          {}
        ),
      /view.stage must be a non-empty string/
    );
  }
);

  test(
    "Marks the selected profession choice menu option",
    () => {
      const payload =
        createDiscordCharacterCreationPayload({
          stage: "profession_choices",
          stageNumber: 5,
          stageCount: 7,
          title: "Profession Choices",
          description:
            "Complete the choices required by your profession.",
          choices: [
            {
              id: "operator_weapon_type",
              type: "weapon_type",
              required: true,
              minimumSelections: 1,
              maximumSelections: 1,
              value: "rifle",
              options: [
                {
                  id: "pistol",
                  name: "Pistol",
                  category: "ranged"
                },
                {
                  id: "rifle",
                  name: "Rifle",
                  category: "ranged"
                }
              ]
            }
          ],
          canMovePrevious: true,
          canMoveNext: true
        });

      const menu =
        payload.components[0].components[0];

      const pistolOption =
        menu.options.find(
          (option) =>
            option.value === "pistol"
        );

      const rifleOption =
        menu.options.find(
          (option) =>
            option.value === "rifle"
        );

      assert.strictEqual(
        pistolOption.default,
        false
      );

      assert.strictEqual(
        rifleOption.default,
        true
      );
    }
  );

  test(
    "Renders no profession choice menu when no options are available",
    () => {
      const payload =
        createDiscordCharacterCreationPayload({
          stage: "profession_choices",
          stageNumber: 5,
          stageCount: 7,
          title: "Profession Choices",
          description:
            "Complete the choices required by your profession.",
          choices: [
            {
              id: "empty_choice",
              type: "weapon_type",
              required: false,
              minimumSelections: 0,
              maximumSelections: 1,
              value: null,
              options: []
            }
          ],
          canMovePrevious: true,
          canMoveNext: true
        });

      assert.deepStrictEqual(
        payload.components,
        []
      );
    }
  );

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD CHARACTER CREATION VIEW TESTS"
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
