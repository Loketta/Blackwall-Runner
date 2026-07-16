"use strict";

const {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES
} = require("./characterCreationDefinition");

const {
  SKILL_DEFINITIONS,
  SKILL_CREATION_RULES
} = require("./skillDefinitions");

const {
  PROFESSION_CHOICE_TYPE,
  PROFESSION_DEFINITIONS
} = require("./professionDefinitions");

const {
  WEAPON_TYPE_DEFINITIONS
} = require("./weaponTypeDefinitions");

const {
  calculateDraftEffectiveSkill
} = require("./effectiveSkillCalculator");

const {
  CHARACTER_CREATION_STAGE
} = require("./characterCreationStages");

const {
  createCharacterCreationStageMachine
} = require("./characterCreationStageMachine");

const STAGE_PRESENTATION = Object.freeze({
  [CHARACTER_CREATION_STAGE.NAME]: Object.freeze({
    title: "Choose Your Name",
    description:
      "Enter the name your character will use."
  }),
  [CHARACTER_CREATION_STAGE.ATTRIBUTES]:
    Object.freeze({
      title: "Allocate Attributes",
      description:
        "Distribute points between your core attributes."
    }),
  [CHARACTER_CREATION_STAGE.SKILLS]:
    Object.freeze({
      title: "Allocate Skills",
      description:
        "Distribute points between your skills."
    }),
  [CHARACTER_CREATION_STAGE.PROFESSION]:
    Object.freeze({
      title: "Choose a Profession",
      description:
        "Select your character's profession."
    }),
  [CHARACTER_CREATION_STAGE.PROFESSION_CHOICES]:
    Object.freeze({
      title: "Profession Choices",
      description:
        "Complete the choices required by your profession."
    }),
  [CHARACTER_CREATION_STAGE.REVIEW]:
    Object.freeze({
      title: "Review Character",
      description:
        "Review the completed character before finalisation."
    }),
  [CHARACTER_CREATION_STAGE.FINISHED]:
    Object.freeze({
      title: "Character Complete",
      description:
        "Character creation is complete."
    })
});

function validateApplication(application) {
  if (!application || typeof application !== "object") {
    throw new TypeError(
      "Character creation application is required."
    );
  }

  const requiredMethods = [
    "startOrResume",
    "setName",
    "setAttribute",
    "setSkill",
    "setProfession",
    "setProfessionChoice",
    "validate",
    "finalise"
  ];

  for (const methodName of requiredMethods) {
    if (typeof application[methodName] !== "function") {
      throw new TypeError(
        `Character creation application requires ${methodName}().`
      );
    }
  }
}

function getDraftName(draft) {
  if (
    draft &&
    draft.identity &&
    typeof draft.identity.name === "string"
  ) {
    return draft.identity.name;
  }

  return "";
}

function getAttributeValues(draft) {
  return Object.fromEntries(
    CORE_ATTRIBUTES.map((attributeId) => [
      attributeId,
      draft.attributes[attributeId]
    ])
  );
}

function calculateAttributePoints(draft) {
  const allocatedPoints = CORE_ATTRIBUTES.reduce(
    (total, attributeId) =>
      total + draft.attributes[attributeId],
    0
  );

  return {
    allocatedPoints,
    remainingPoints:
      ATTRIBUTE_RULES.totalBudget -
      allocatedPoints
  };
}

function getSkillValues(draft) {
  return Object.fromEntries(
    SKILL_DEFINITIONS.map((skill) => [
      skill.id,
      draft.skills[skill.id]
    ])
  );
}

function calculateSkillPoints(draft) {
  const allocatedPoints = SKILL_DEFINITIONS.reduce(
    (total, skill) =>
      total + draft.skills[skill.id],
    0
  );

  return {
    allocatedPoints,
    remainingPoints:
      SKILL_CREATION_RULES.totalBudget -
      allocatedPoints
  };
}

function getSkillOptions() {
  return SKILL_DEFINITIONS.map((skill) =>
    Object.freeze({
      id: skill.id,
      name: skill.name,
      defaultAttribute:
        skill.defaultAttribute,
      alternateAttributes:
        skill.alternateAttributes,
      categories: skill.categories,
      status: skill.status,
      notes: skill.notes
    })
  );
}

function getSelectedProfessionId(draft) {
  if (!draft.profession) {
    return null;
  }

  if (typeof draft.profession === "string") {
    return draft.profession;
  }

  if (
    typeof draft.profession === "object" &&
    typeof draft.profession.id === "string"
  ) {
    return draft.profession.id;
  }

  return null;
}

function getSelectedProfession(draft) {
  const professionId =
    getSelectedProfessionId(draft);

  if (!professionId) {
    return null;
  }

  return (
    PROFESSION_DEFINITIONS.find(
      (profession) =>
        profession.id === professionId
    ) ?? null
  );
}

function getProfessionOptions() {
  return PROFESSION_DEFINITIONS.map(
    (profession) =>
      Object.freeze({
        id: profession.id,
        name: profession.name,
        status: profession.status,
        aptitudes: profession.aptitudes,
        choices: profession.choices,
        mastery: profession.mastery
      })
  );
}

function getProfessionChoiceValues(draft) {
  return {
    ...(draft.professionChoices ?? {})
  };
}

function getChoiceOptions(choice) {
  if (
    choice.type ===
    PROFESSION_CHOICE_TYPE.WEAPON_TYPE
  ) {
    return WEAPON_TYPE_DEFINITIONS.map(
      (weaponType) =>
        Object.freeze({
          id: weaponType.id,
          name: weaponType.name,
          category: weaponType.category
        })
    );
  }

  return [];
}

function getProfessionChoiceViews(draft) {
  const profession =
    getSelectedProfession(draft);

  if (!profession) {
    return [];
  }

  const values =
    getProfessionChoiceValues(draft);

  return profession.choices.map((choice) => {
    const options = getChoiceOptions(choice);

    Object.freeze(options);

    return Object.freeze({
      id: choice.id,
      type: choice.type,
      required: choice.required === true,
      minimumSelections:
        choice.minimumSelections,
      maximumSelections:
        choice.maximumSelections,
      value: values[choice.id] ?? null,
      options
    });
  });
}

function hasRequiredProfessionChoices(draft) {
  const profession =
    getSelectedProfession(draft);

  if (!profession) {
    return false;
  }

  const values =
    getProfessionChoiceValues(draft);

  return profession.choices.every((choice) => {
    if (!choice.required) {
      return true;
    }

    const value = values[choice.id];

    return (
      typeof value === "string" &&
      value.trim().length > 0
    );
  });
}

function createEffectiveSkillSummary(draft) {
  return Object.fromEntries(
    SKILL_DEFINITIONS.map((skill) => {
      const result =
        calculateDraftEffectiveSkill({
          draft,
          skillId: skill.id,
          professionLevel: 1
        });

      return [
        skill.id,
        Object.freeze({
          id: skill.id,
          name: skill.name,
          baseRank: result.baseRank,
          professionBonus:
            result.professionBonus,
          equipmentBonus:
            result.equipmentBonus,
          temporaryModifiers:
            result.temporaryModifiers,
          effectiveRank:
            result.effectiveRank
        })
      ];
    })
  );
}

function createReviewSummary(draft, application) {
  const profession =
    getSelectedProfession(draft);

  const validation =
    application.validate(draft);

  if (
    !validation ||
    typeof validation.valid !== "boolean" ||
    !Array.isArray(validation.errors)
  ) {
    throw new Error(
      "Character creation application returned an invalid validation result."
    );
  }

  const attributes =
    getAttributeValues(draft);

  const skills =
    getSkillValues(draft);

  const effectiveSkills =
    createEffectiveSkillSummary(draft);

  Object.freeze(attributes);
  Object.freeze(skills);
  Object.freeze(effectiveSkills);
  Object.freeze(validation.errors);

  const professionSummary = profession
    ? Object.freeze({
        id: profession.id,
        name: profession.name,
        status: profession.status,
        aptitudes: profession.aptitudes,
        mastery: profession.mastery
      })
    : null;

  const professionChoices =
    getProfessionChoiceValues(draft);

  Object.freeze(professionChoices);

  return Object.freeze({
    identity: Object.freeze({
      name: getDraftName(draft)
    }),
    attributes,
    skills,
    effectiveSkills,
    profession: professionSummary,
    professionChoices,
    validation: Object.freeze({
      valid: validation.valid,
      errors: validation.errors
    }),
    readyToFinalise: validation.valid,
    contextualSkillNote:
      "Context-dependent bonuses, including selected weapon-type bonuses, are applied when resolving the relevant check."
  });
}

function freezeView(view) {
  if (
    view.values &&
    typeof view.values === "object"
  ) {
    Object.freeze(view.values);
  }

  if (
    view.rules &&
    typeof view.rules === "object"
  ) {
    Object.freeze(view.rules);
  }

  if (Array.isArray(view.options)) {
    Object.freeze(view.options);
  }

  if (Array.isArray(view.choices)) {
    Object.freeze(view.choices);
  }

  if (
    view.review &&
    typeof view.review === "object"
  ) {
    Object.freeze(view.review);
  }

  if (Array.isArray(view.availableActions)) {
    Object.freeze(view.availableActions);
  }

  return Object.freeze(view);
}

function createCharacterCreationController({
  application
}) {
  validateApplication(application);

  let draft = null;
  let stageMachine = null;
  let active = false;
  let created = false;
  let finalisationResult = null;

  function requireActiveSession() {
    if (!active || !draft || !stageMachine) {
      throw new Error(
        "Character creation has not been started."
      );
    }
  }

  function canContinueFromCurrentStage() {
    const stage = stageMachine.getCurrentStage();

    if (stage === CHARACTER_CREATION_STAGE.NAME) {
      return getDraftName(draft).trim().length > 0;
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.ATTRIBUTES
    ) {
      return (
        calculateAttributePoints(draft)
          .remainingPoints === 0
      );
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.SKILLS
    ) {
      return (
        calculateSkillPoints(draft)
          .remainingPoints === 0
      );
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION
    ) {
      return (
        getSelectedProfessionId(draft) !== null
      );
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION_CHOICES
    ) {
      return hasRequiredProfessionChoices(draft);
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.REVIEW
    ) {
      return false;
    }

    return true;
  }

  function getAvailableActions(stage) {
    const actions = [];

    if (
      stage === CHARACTER_CREATION_STAGE.FINISHED
    ) {
      return actions;
    }

    if (
      stage === CHARACTER_CREATION_STAGE.NAME
    ) {
      actions.push("submit_name");
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.ATTRIBUTES
    ) {
      actions.push("set_attribute");
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.SKILLS
    ) {
      actions.push("set_skill");
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION
    ) {
      actions.push("select_profession");
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION_CHOICES
    ) {
      actions.push("set_profession_choice");
    }

    if (stageMachine.canMovePrevious()) {
      actions.push("previous");
    }

    if (
      stageMachine.canMoveNext() &&
      canContinueFromCurrentStage()
    ) {
      actions.push("next");
    }

    actions.push("cancel");

    return actions;
  }

  function renderCurrentStep() {
    requireActiveSession();

    const stage = stageMachine.getCurrentStage();
    const navigation = stageMachine.getState();
    const presentation = STAGE_PRESENTATION[stage];

    const view = {
      stage,
      title: presentation.title,
      description: presentation.description,
      draftId: draft.id,
      revision: draft.revision,
      created,
      values: {},
      stageNumber: navigation.stageNumber,
      stageCount: navigation.stageCount,
      canMoveNext:
        navigation.canMoveNext &&
        canContinueFromCurrentStage(),
      canMovePrevious:
        navigation.canMovePrevious,
      complete: navigation.complete,
      availableActions:
        getAvailableActions(stage)
    };

    if (stage === CHARACTER_CREATION_STAGE.NAME) {
      view.values = {
        name: getDraftName(draft)
      };
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.ATTRIBUTES
    ) {
      const points =
        calculateAttributePoints(draft);

      view.values = getAttributeValues(draft);
      view.rules = {
        minimum: ATTRIBUTE_RULES.minimum,
        maximum: ATTRIBUTE_RULES.maximum,
        totalBudget:
          ATTRIBUTE_RULES.totalBudget
      };
      view.allocatedPoints =
        points.allocatedPoints;
      view.remainingPoints =
        points.remainingPoints;
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.SKILLS
    ) {
      const points =
        calculateSkillPoints(draft);

      view.values = getSkillValues(draft);
      view.options = getSkillOptions();
      view.rules = {
        minimum:
          SKILL_CREATION_RULES.minimum,
        maximum:
          SKILL_CREATION_RULES.maximum,
        totalBudget:
          SKILL_CREATION_RULES.totalBudget,
        untrainedAllowed:
          SKILL_CREATION_RULES.untrainedAllowed,
        untrainedRollMode:
          SKILL_CREATION_RULES.untrainedRollMode
      };
      view.allocatedPoints =
        points.allocatedPoints;
      view.remainingPoints =
        points.remainingPoints;
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION
    ) {
      view.values = {
        professionId:
          getSelectedProfessionId(draft)
      };
      view.options = getProfessionOptions();
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION_CHOICES
    ) {
      view.values =
        getProfessionChoiceValues(draft);
      view.choices =
        getProfessionChoiceViews(draft);
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.REVIEW
    ) {
      view.review =
        createReviewSummary(
          draft,
          application
        );

      view.availableActions = [
        "previous"
      ];

      if (view.review.readyToFinalise) {
        view.availableActions.push(
          "finalise"
        );
      }

      view.availableActions.push("cancel");
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.FINISHED
    ) {
      view.values = {};
      view.availableActions = [];
      view.character =
        finalisationResult?.character ?? null;
      view.createdCharacter =
        finalisationResult?.created ?? false;
      view.complete = true;
      view.canMoveNext = false;
      view.canMovePrevious = false;
    }

    return freezeView(view);
  }

  function start({
    ownerId,
    platform
  }) {
    const result = application.startOrResume({
      ownerId,
      platform
    });

    if (
      !result ||
      !result.draft ||
      typeof result.created !== "boolean"
    ) {
      throw new Error(
        "Character creation application returned an invalid start result."
      );
    }

    draft = result.draft;
    created = result.created;
    active = true;

    stageMachine =
      createCharacterCreationStageMachine();

    return renderCurrentStep();
  }

  function submit(input = {}) {
    requireActiveSession();

    const stage = stageMachine.getCurrentStage();

    if (stage === CHARACTER_CREATION_STAGE.NAME) {
      const result = application.setName({
        draft,
        expectedRevision: draft.revision,
        name: input.value
      });

      if (!result || !result.draft) {
        throw new Error(
          "Character creation application returned an invalid update result."
        );
      }

      draft = result.draft;

      return renderCurrentStep();
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.ATTRIBUTES
    ) {
      const result = application.setAttribute({
        draft,
        expectedRevision: draft.revision,
        attributeId: input.attributeId,
        value: input.value
      });

      if (!result || !result.draft) {
        throw new Error(
          "Character creation application returned an invalid update result."
        );
      }

      draft = result.draft;

      return renderCurrentStep();
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.SKILLS
    ) {
      const result = application.setSkill({
        draft,
        expectedRevision: draft.revision,
        skillId: input.skillId,
        value: input.value
      });

      if (!result || !result.draft) {
        throw new Error(
          "Character creation application returned an invalid update result."
        );
      }

      draft = result.draft;

      return renderCurrentStep();
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION
    ) {
      const result = application.setProfession({
        draft,
        expectedRevision: draft.revision,
        professionId: input.professionId
      });

      if (!result || !result.draft) {
        throw new Error(
          "Character creation application returned an invalid update result."
        );
      }

      draft = result.draft;

      return renderCurrentStep();
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION_CHOICES
    ) {
      const result =
        application.setProfessionChoice({
          draft,
          expectedRevision: draft.revision,
          choiceId: input.choiceId,
          value: input.value
        });

      if (!result || !result.draft) {
        throw new Error(
          "Character creation application returned an invalid update result."
        );
      }

      draft = result.draft;

      return renderCurrentStep();
    }

    throw new Error(
      `Submission is not implemented for stage: ${stage}`
    );
  }

  function next() {
    requireActiveSession();

    const stage = stageMachine.getCurrentStage();

    if (
      stage === CHARACTER_CREATION_STAGE.NAME &&
      !canContinueFromCurrentStage()
    ) {
      throw new Error(
        "A character name is required before continuing."
      );
    }

    if (
      stage ===
        CHARACTER_CREATION_STAGE.ATTRIBUTES &&
      !canContinueFromCurrentStage()
    ) {
      throw new Error(
        "All attribute points must be allocated before continuing."
      );
    }

    if (
      stage ===
        CHARACTER_CREATION_STAGE.SKILLS &&
      !canContinueFromCurrentStage()
    ) {
      throw new Error(
        "All skill points must be allocated before continuing."
      );
    }

    if (
      stage ===
        CHARACTER_CREATION_STAGE.PROFESSION &&
      !canContinueFromCurrentStage()
    ) {
      throw new Error(
        "A profession must be selected before continuing."
      );
    }

    if (
      stage ===
      CHARACTER_CREATION_STAGE.PROFESSION
    ) {
      const profession =
        getSelectedProfession(draft);

      stageMachine.next();

      if (
        profession &&
        profession.choices.length === 0
      ) {
        stageMachine.next();
      }

      return renderCurrentStep();
    }

    if (
      stage ===
        CHARACTER_CREATION_STAGE.PROFESSION_CHOICES &&
      !canContinueFromCurrentStage()
    ) {
      throw new Error(
        "All required profession choices must be completed before continuing."
      );
    }

    stageMachine.next();

    return renderCurrentStep();
  }

  function previous() {
    requireActiveSession();

    if (
      stageMachine.getCurrentStage() ===
      CHARACTER_CREATION_STAGE.FINISHED
    ) {
      throw new Error(
        "A finalised character cannot return to character creation."
      );
    }

    stageMachine.previous();

    return renderCurrentStep();
  }

  function finalise({
    startingLocation,
    startingCredits = 0,
    startingInventory = []
  } = {}) {
    requireActiveSession();

    if (
      stageMachine.getCurrentStage() !==
      CHARACTER_CREATION_STAGE.REVIEW
    ) {
      throw new Error(
        "Character creation can only be finalised from review."
      );
    }

    const validation =
      application.validate(draft);

    if (
      !validation ||
      validation.valid !== true
    ) {
      throw new Error(
        "Character creation cannot be finalised while validation errors remain."
      );
    }

    const result = application.finalise({
      draft,
      expectedRevision: draft.revision,
      startingLocation,
      startingCredits,
      startingInventory
    });

    if (
      !result ||
      !result.character ||
      !result.finalisedDraft ||
      typeof result.created !== "boolean"
    ) {
      throw new Error(
        "Character creation application returned an invalid finalisation result."
      );
    }

    finalisationResult = result;
    draft = result.finalisedDraft;

    stageMachine.moveTo(
      CHARACTER_CREATION_STAGE.FINISHED
    );

    return renderCurrentStep();
  }

  function cancel() {
    requireActiveSession();

    const result = Object.freeze({
      cancelled: true,
      draftId: draft.id,
      revision: draft.revision
    });

    draft = null;
    stageMachine = null;
    active = false;
    created = false;
    finalisationResult = null;

    return result;
  }

  function isActive() {
    return active;
  }

  return Object.freeze({
    start,
    next,
    previous,
    submit,
    finalise,
    cancel,
    renderCurrentStep,
    isActive
  });
}

module.exports = {
  createCharacterCreationController
};
