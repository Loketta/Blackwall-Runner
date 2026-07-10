# Simulation System

## Status

This document defines how actions, elapsed time and world consequences interact in Blackwall Runner.

## Core Principle

> The player owns intention. The engine owns truth. The world owns consequence. The AI owns presentation.

Time is a consequence of meaningful activity. It is not a tax applied to every command.

The world should feel alive without discouraging players from interacting with it.

## Player Experience

Players should make natural decisions and observe believable consequences:

* daylight changes;
* shops open and close;
* NPCs follow routines;
* weather develops;
* deadlines approach;
* hunger, fatigue and financial pressures emerge naturally.

Players should not feel that they are manually managing the simulation.

## Meaningful Time

World time advances when an action occupies a meaningful period in the fiction.

World time does not advance merely because a command was issued.

Free actions normally include:

* looking around;
* checking inventory;
* picking up or dropping an ordinary portable item;
* opening an unsecured container;
* speaking briefly;
* answering an ally;
* making a quick observation;
* drawing or stowing an accessible item outside combat.

## Contextual Resolution

Duration cannot be determined from the action verb alone.

The engine must consider:

* size and weight;
* required care;
* distance and terrain;
* transport;
* tools and assistance;
* injuries and encumbrance;
* opposition;
* task complexity;
* urgency;
* risk of failure or damage.

Examples:

* Picking up a protein bar is free.
* Lifting a steel beam from a trapped ally requires effort, may require a check and consumes meaningful time.
* Dropping a small object is free.
* Carefully lowering an engine block without damaging it requires sustained effort, assistance or equipment.
* Saying one sentence is free.
* Conducting a long interview or negotiation consumes time.

The engine resolves the action first. Elapsed time is one result of that resolution.

## Action Significance

### Free

Negligible time within the current scene.

Typical world-clock duration: zero minutes.

Examples include brief speech, ordinary item handling, looking and minor positioning.

### Minor

A short but noticeable task.

Typical duration: approximately one to several minutes.

Examples include carefully searching a drawer, climbing a long ladder or opening a simple secured access point.

### Standard

A meaningful activity that advances the scene.

Typical duration: several minutes to roughly half an hour.

Examples include nearby travel, thoroughly searching a room, basic medical treatment, substantive conversation or a simple repair.

### Major

A substantial commitment.

Typical duration: tens of minutes to several hours.

Examples include city travel, extensive investigation, major repairs, surgery, crafting or sustained negotiation.

### Extended

An activity measured in hours or longer.

Examples include sleep, long-distance travel, training, major fabrication and downtime projects.

These classifications guide resolution but do not impose universal fixed durations.

## Conversations

Dialogue is not timed by message count.

Brief exchanges occur within the same fictional moment and are free.

Time advances when dialogue becomes a sustained activity, such as:

* an interview;
* a planning session;
* a negotiation;
* an interrogation;
* an extended personal conversation;
* a detailed briefing.

The AI may identify the nature and scope of a conversation. The engine determines and records elapsed time.

## Travel

Travel is a major driver of world progression.

Travel duration may consider:

* origin and destination;
* distance;
* route;
* movement method;
* traffic;
* weather;
* hazards;
* injuries;
* encumbrance;
* stealth or caution.

Movement within a room may be free. Movement between locations may consume meaningful time.

## Combat

Combat uses a dedicated high-resolution clock measured in rounds or seconds.

World events should not be processed separately after every combatant action.

When combat ends, accumulated combat duration is converted into world time. Treatment, searching and cleanup are separate activities that may take considerably longer than the fight.

## Multiple Clocks

### Narrative Clock

Tracks whether the current scene continues or a meaningful activity has concluded.

### Combat Clock

Tracks rounds, turns and seconds.

### World Clock

Tracks minutes, hours, days, schedules and immediate events.

### Campaign Clock

Tracks weeks, faction activity, economic changes and long-term developments.

Lower-resolution clocks update only when accumulated activity becomes meaningful at the next level.

## Multiplayer Behaviour

Time belongs to the shared world rather than independently to each command.

Players within the same scene may perform several free or simultaneous actions without repeatedly advancing time.

When a sustained activity occurs:

* compatible actions may happen concurrently;
* other players may act during the same interval;
* incompatible activities may require separate elapsed periods;
* world time advances by the shared fictional duration, not the sum of every command.

## AI Responsibilities

The AI may:

* interpret intention;
* identify relevant context;
* suggest an action-significance category;
* narrate effort, elapsed time and consequences;
* ask for meaningful choices.

The AI must not:

* mutate authoritative state;
* invent unrestricted durations;
* bypass mechanical requirements;
* declare unvalidated success;
* create unauthorised items, statistics or benefits.

## Engine Responsibilities

The engine must:

* validate actions;
* resolve mechanical requirements;
* determine whether time meaningfully passes;
* calculate elapsed duration from rules and context;
* update world time;
* invoke scheduled systems;
* process due events;
* persist state;
* return structured results for presentation.

## Target Pipeline

```text
Player intention
    ↓
Intent interpretation
    ↓
Action validation
    ↓
Contextual resolution
    ↓
Outcome and elapsed time
    ↓
Simulation advancement
    ↓
Scheduler and world events
    ↓
Persistence
    ↓
AI presentation
```

A failed attempt may still consume time when it required meaningful effort.

## Initial Implementation Boundary

The first implementation will:

1. introduce a central simulation service;
2. accept elapsed minutes from action resolution;
3. advance world time in one place;
4. process existing events through that path;
5. preserve free actions at zero minutes;
6. keep existing commands working;
7. establish extension points for future contextual durations.

It will not yet implement:

* natural-language duration inference;
* combat timing;
* multiplayer concurrency;
* complex encumbrance;
* NPC schedules;
* every action category.

## Design Test

A decision to advance time should satisfy both questions:

1. Would a reasonable tabletop GM treat this as meaningful elapsed time?
2. Does advancing time improve believable consequence without discouraging ordinary interaction?

If either answer is no, the action should normally remain free.
