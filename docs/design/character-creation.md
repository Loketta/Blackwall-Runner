# Character Creation

## Status

This document defines how the AI and engine collaborate to create mechanically legal, narratively coherent and player-owned characters.

## Core Principle

Character creation should create a person first and a legal character sheet second.

The AI facilitates a conversation similar to an experienced tabletop GM. The engine enforces every mechanical boundary.

## Target Experience

The process should feel like a guided character interview rather than a form.

A player may begin with:

* a broad concept;
* a detailed history;
* a visual idea;
* a preferred role;
* a desired style of play.

The process should help establish:

* identity;
* formative experiences;
* motivations;
* fears;
* relationships;
* moral boundaries;
* preferred methods;
* unresolved consequences from the past.

The player retains final authority over the character's identity and final mechanical build.

## Reference Model

Naoko's creation is the target model.

Her mechanics emerged from a developed concept:

* former corporate field operative;
* protector of netrunner teams;
* disciplined and physically capable;
* jaded by corporate atrocities;
* committed to protecting innocents;
* unwilling to harm children;
* experienced with pistols and sniper rifles;
* shaped by relationships, betrayals and moral choices.

Her statistics and equipment supported the person created through conversation.

## Separation of Authority

### Player

The player owns:

* concept;
* identity;
* personality;
* priorities;
* history;
* relationships;
* moral boundaries;
* desired play style;
* acceptance of the final character.

### AI

The AI owns:

* conversational guidance;
* purposeful follow-up questions;
* synthesis;
* presenting meaningful options;
* translating narrative traits into mechanical suggestions;
* explaining trade-offs;
* producing the final narrative summary.

### Engine

The engine owns:

* supported rulesets;
* legal roles or classes;
* stat limits;
* point budgets;
* skill limits;
* starting resources;
* permitted equipment;
* derived values;
* validation;
* persistence.

The AI proposes. The engine validates. The player approves.

## Mechanical Rigidity

The engine must prevent:

* exceeding stat budgets;
* illegal attribute values;
* excessive skill allocation;
* unavailable equipment;
* unaffordable purchases;
* incompatible options;
* duplicate restricted benefits;
* missing required choices;
* AI-invented advantages.

Narrative richness must not create unrestricted mechanical power.

A dramatic history may create story hooks, relationships and consequences, but it cannot grant illegal statistics or superior equipment.

## Conversational Flow

A typical creation process may:

1. establish the broad concept;
2. explore background and formative events;
3. identify motivations and current goals;
4. establish relationships and loyalties;
5. identify moral boundaries and vulnerabilities;
6. explore preferred methods;
7. suggest suitable mechanical roles;
8. propose legal stat priorities;
9. propose legal skills and equipment;
10. explain compromises;
11. allow revisions;
12. validate the build;
13. obtain explicit player approval;
14. persist the character;
15. present a narrative and mechanical summary.

This is a flexible conversation, not a mandatory fixed questionnaire.

## Purposeful Questions

Questions should reveal information relevant to identity or mechanics.

Examples include:

* What kind of work did the character do before the campaign?
* What event changed the direction of their life?
* Who do they feel responsible for?
* What line will they not cross?
* Do they solve danger through force, preparation, persuasion or technical ability?
* Which part of their past still causes problems?
* What do they want badly enough to take risks for?

The AI should not ask again for information already established.

## Mechanical Translation

The AI converts the conversation into a structured proposal.

```json
{
  "concept": "Former corporate security operator",
  "suggestedRole": "Solo",
  "attributePriorities": [
    "body",
    "dexterity",
    "will"
  ],
  "skillThemes": [
    "handguns",
    "shoulderArms",
    "perception",
    "tactics"
  ],
  "equipmentThemes": [
    "veryHeavyPistol",
    "sniperRifle",
    "lightArmorjack"
  ]
}
```

The proposal is not authoritative until the engine validates it and the player accepts it.

## Revision and Consent

The AI should explain its suggestions and relevant trade-offs.

The player may revise the proposal in natural language.

A character must not be finalised until the player explicitly accepts a mechanically legal build.

## Equipment

Starting equipment must come from ruleset-defined lists, packages, budgets or availability constraints.

The AI may recommend suitable equipment but cannot create superior or unavailable items.

Legal equipment may receive narrative personalisation without changing its mechanics, such as:

* a cloth-wrapped rifle;
* a scratched-out corporate logo;
* a pistol described as the character's first personal purchase.

## Background Consequences

Character history should produce hooks rather than free advantages.

Possible results include:

* contacts;
* rivals;
* obligations;
* faction relationships;
* secrets;
* beliefs;
* personal items;
* campaign hooks.

These must remain within campaign and ruleset constraints.

## Ruleset Independence

The core process must not hardcode Cyberpunk RED.

Ruleset modules should define:

* attributes;
* minimum and maximum values;
* allocation methods;
* roles or classes;
* skills;
* derived statistics;
* starting resources;
* equipment catalogues;
* legal combinations;
* validation rules;
* setting-specific prompts.

Cyberpunk RED may be the first implemented ruleset.

## Character Record

The final persisted record should distinguish:

* authoritative mechanical data;
* player-authored identity;
* AI-assisted narrative material;
* campaign state;
* the origin of starting selections.

A future structure may include:

```text
identity
background
values
relationships
mechanics
equipment
resources
campaignState
creationMetadata
```

## Initial Implementation Boundary

The first playable creation system will:

1. create a unique player record;
2. collect a name and core concept;
3. support one initial ruleset;
4. offer legal role choices;
5. enforce stat allocation;
6. restrict starting skills and equipment;
7. allow revisions;
8. persist only validated characters;
9. produce a concise narrative summary.

It will not initially require:

* every available lifepath option;
* extensive generated NPC relationships;
* unrestricted free-form equipment;
* multiple simultaneous rulesets;
* voice interaction;
* perfect interpretation of every concept.

## Design Test

A character-creation decision must satisfy all three questions:

1. Does it preserve player ownership?
2. Is it mechanically legal and bounded?
3. Does it help the player understand the person they will portray?

If any answer is no, the design should be revised.
