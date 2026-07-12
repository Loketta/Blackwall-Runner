# Event Pipeline

## Purpose

The Event Pipeline records authoritative facts about everything that happens within or affects the simulated world.

It connects player actions, simulation, NPC behaviour, hidden information, scheduled consequences, campaign direction, administrative intervention and presentation.

The system must remain genre-neutral and independent from any specific interface, setting or ruleset.

## Core Principle

An event represents anything that happened.

An event does not need to be immediately visible, mechanically significant or narratively important. A minor occurrence may become relevant later.

For example:

1. A player enters a warehouse.
2. A hidden motion sensor detects the player.
3. The sensor stores a record.
4. An enemy later reviews the record.
5. The enemy begins an investigation.

The engine therefore preserves complete factual history, including hidden and apparently mundane events.

## Authority

The engine owns accepted truth.

The AI may propose plausible events and narrate accepted outcomes, but it may not directly mutate authoritative world state.

Normal event flow:

```text
Action, simulation or AI proposal
        ↓
Event candidate
        ↓
Validation
        ↓
Accepted event
        ↓
State mutation
        ↓
Secondary events
        ↓
Knowledge distribution
        ↓
Presentation
        ↓
Persistent history
```

Administrative intervention is a separate privileged pathway capable of making validated and audited state amendments.

## Events Are Facts

Events store structured facts rather than narrative prose.

Presentation may describe the same event differently according to interface, campaign tone and character knowledge.

Presentation never determines what happened.

## Event Persistence

Accepted events are immutable historical records.

Later discoveries and consequences create linked events rather than rewriting earlier events.

The full event history should be preserved.

The AI should receive selectively retrieved events and summaries relevant to the current situation rather than the complete raw history.

Summaries must never replace or delete their authoritative source events.

## Event Categories

Common events should use broad categories such as:

- player;
- NPC;
- movement;
- interaction;
- item;
- combat;
- environment;
- time;
- faction;
- economy;
- knowledge;
- campaign;
- administrative;
- other.

The `other` category supports unusual, plot-specific or setting-specific events that do not fit the common categories.

An `other` event must still use the standard event contract and structured data.

## Event Detail

Events contain the minimum detail needed to preserve causality, mechanical method, meaningful consequences and knowledge boundaries.

A mundane interaction may simply record that a door was opened.

If the player used a skill, tool or special method, the event should preserve those details.

Special event detail may include:

- skill used;
- tool used;
- difficulty;
- check result;
- noise generated;
- damage caused;
- security bypassed;
- other meaningful consequences.

This allows ordinary interactions to remain mundane while giving the AI enough information to narrate special instances appropriately.

## Event Chains

Accepted events may trigger further event candidates.

For example:

```text
Door opened
    ↓
Security evaluated
    ↓
Alarm attempted
    ↓
Alarm activated
    ↓
Guards alerted
```

Event chains are not predetermined scripts.

Every consequence must be evaluated against current world state.

If the players previously disabled the security system or cut power, the chain may instead become:

```text
Door opened
    ↓
Security evaluated
    ↓
Alarm attempted
    ↓
Power unavailable
    ↓
Alarm failed
```

The alarm mechanism was still triggered, but player preparation interrupted the consequence.

Events may therefore succeed, fail, be interrupted, be redirected or partially complete.

## Scheduled Events

Some accepted events create future scheduled events.

For example:

```text
Emergency call received
        ↓
Police response selected
        ↓
Arrival time calculated
        ↓
Police arrival scheduled
```

Scheduled events use in-world time.

Only player actions advance shared world time. Scheduled events remain pending while no player action advances time.

Timing must be contextual.

Police response may depend on:

- proximity to a police station;
- available patrols;
- district priority;
- current workload;
- incident severity;
- travel conditions;
- an approved random table.

A response close to a police station may consistently take two or three minutes.

A response farther away may use a suitable variable range.

The selected response and estimated arrival time become simulation facts.

Players may discover those facts through legitimate actions such as intercepting radio traffic.

## Information and Knowledge

An event occurring does not mean every entity knows it occurred.

The system must distinguish:

- what happened;
- who observed it;
- who currently knows it;
- what was inferred;
- what may be presented to each player.

Information may itself produce events.

For example:

```text
Police transmission broadcast
        ↓
Player intercepts signal
        ↓
Player decodes transmission
        ↓
Player gains estimated arrival information
```

Players should receive only information they could legitimately observe, discover, intercept or infer.

## Hidden and Passive Checks

Hidden and passive checks are persistent events.

A failed passive check remains authoritative for that player and hidden target until one of the following occurs:

1. The relevant player statistic increases above the value used for the failed check.
2. The player directly examines the precise hiding place in a way that makes the hidden feature impossible to overlook.
3. The environment changes in a way that materially improves detection.

Repeated general searching, repeated `look` actions or leaving and returning do not automatically permit another passive check.

Direct examination that makes concealment impossible produces automatic discovery rather than another passive roll.

Check history is individual to each player unless knowledge is communicated through another event.

## AI-Created Events

The AI may create and activate plausible events through validated proposals.

This allows the world to feel dynamic without giving the AI unrestricted authority over truth.

AI-created events must be:

- realistic within the current situation;
- consistent with the setting and genre;
- proportionate rather than constant;
- validated against current state;
- limited by available entities, resources and capabilities.

The AI may propose:

- incidental environmental activity;
- suitable background complications;
- available reinforcements;
- reactions from nearby entities;
- ephemeral NPCs from approved templates;
- other plausible world activity.

The AI may not create events merely to force a predetermined plot, contradict established truth or invalidate player preparation.

## NPC Persistence

NPCs have two persistence classifications:

- ephemeral;
- persistent.

Ephemeral NPCs use approved templates.

The AI may give an ephemeral NPC presentation details such as a name, appearance, voice or minor personality traits.

An ephemeral NPC may be promoted in place when:

- player interaction makes continued existence important;
- the NPC becomes plot relevant;
- unresolved consequences depend on the NPC;
- the Campaign Director assigns an ongoing role;
- a designer directive requires continued use;
- an administrator explicitly promotes the NPC.

Promotion preserves the same entity identity, established presentation details and event history.

Persistent NPCs may possess:

- statistics;
- ambitions;
- goals;
- schedules;
- relationships;
- knowledge;
- possessions;
- commitments.

## Simulation Fidelity

Simulation detail changes according to player relevance.

### Background activity

When players are not meaningfully involved, the AI may resolve activity narratively within established constraints.

Broad accepted outcomes must still become events.

A conflict between two gangs does not require every combatant to make individual attack and damage rolls while the conflict remains outside player focus.

### Observed background activity

Players may observe or interact with part of a background situation while other activity continues narratively.

For example, some gang members may stop to argue with the players while fighting continues in the background.

### Direct involvement

When players enter a mechanically relevant conflict, deterministic rules apply to entities capable of materially affecting them.

The AI may narrate the results but may not choose mechanical outcomes.

## Persistent NPC Behaviour

Persistent NPCs follow their established statistics, traits, ambitions, goals, schedules, relationships, commitments and knowledge.

If an NPC tells the players they can be found at a location during expected hours, the players should ordinarily find them there.

An NPC may deviate when a recorded event provides a valid reason, such as:

- an emergency;
- an attack;
- arrest;
- changed orders;
- a changed commitment;
- a player-created consequence.

The AI may not move an NPC merely because their unexpected absence would be dramatic.

## Campaign Director

The Campaign Director plans at three levels.

### Immediate

The next scene may be planned in high detail.

### Near-term

The next session may contain several flexible possibilities.

### Long-term

The overall campaign should retain broad strokes, themes, pressures, objectives, secrets and possible outcomes.

Plans must adapt to player behaviour.

The Campaign Director should evolve the story around the players chosen direction rather than forcing them back towards a predetermined route.

## Campaign Control Layers

Blackwall Runner supports three distinct campaign-control layers.

### Player preferences

Players may provide desired themes, tone, character ties, content preferences and other campaign guidance.

### Designer directives

A trusted designer may privately guide pacing, themes, hooks and future opportunities without directly changing established game state.

### Administrative intervention

An authorised administrator may make validated state changes when repair, correction or exceptional intervention is required.

Administrative interventions must be auditable and should be reversible where practical.

The AI may integrate an accepted amendment into the fiction but may not alter its mechanical effect.

## Contextual Time

Action duration is contextual.

There is no universal duration for eating, travelling, searching, conversation or similar actions.

A vending-machine snack during a mission should take far less time than a sit-down meal during which the group discusses the campaign.

The AI may propose a reasonable duration based on circumstances.

The engine or ruleset validates that duration before time advances.

## Hard AI Boundaries

The AI must never:

- violate physical reality without explicit setting support;
- introduce genre-incompatible objects or capabilities;
- contradict established world truth;
- decide a player characters intentions;
- invent player dialogue;
- invent player emotions;
- add undeclared player actions;
- reveal information outside the recipients knowledge;
- invent loot without an authorised source;
- ignore deterministic mechanics when players are directly involved;
- invalidate player preparation merely to preserve a planned scene.

The AI may elaborate the physical execution of a declared player action, but it may not extend the action beyond the players stated intent.

Loot must originate from:

- existing world state;
- entity inventories;
- defined locations;
- approved loot tables;
- procedural generation authorised by a ruleset;
- campaign rewards;
- validated event proposals;
- administrative intervention.

## Event Safety

Event chains must terminate safely.

The implementation must eventually support:

- causal chain identifiers;
- processing-depth limits;
- duplicate suppression where appropriate;
- idempotent handlers;
- validation before persistence;
- transactional state mutation;
- circular dependency detection;
- records for rejected event candidates.

These safeguards must not prevent legitimate repeated events.

## World Persistence

The world exists persistently but remains frozen while no player action advances time.

Events and consequences persist between:

- sessions;
- characters;
- player groups;
- interfaces.

Later characters and groups may encounter the lasting consequences of earlier play.

> Players inhabit a world that remembers them, changes because of them and remains meaningfully altered after they leave.
