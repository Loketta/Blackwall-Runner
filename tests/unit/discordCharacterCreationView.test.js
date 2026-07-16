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
  "Rejects unsupported payload stages",
  () => {
    assert.throws(
      () =>
        createDiscordCharacterCreationPayload({
          stage: "attributes"
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
