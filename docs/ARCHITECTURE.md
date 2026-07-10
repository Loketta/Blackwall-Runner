# Blackwall Runner Architecture

Version: 0.1.x Alpha

---

# Vision

Blackwall Runner is a persistent RPG simulation engine.

It is **not** an AI chatbot with game mechanics.

It is **not** a Discord bot.

It is **not** a website.

The engine is the authoritative simulation of the world.

Every interface—CLI, Discord, web, or AI narrator—communicates with the same engine.

---

# Core Philosophy

The most important rule in Blackwall Runner is:

> **The Engine owns truth.**

> **The Presentation Layer describes truth.**

If something permanently changes the world, the engine decides.

If something explains that change to a player, the presentation layer decides.

Examples:

| Engine decides | Presentation decides |
|----------------|----------------------|
| Shop opens | "The battered shutters grind open." |
| NPC moves | "You notice Finch crossing the street." |
| Player takes damage | "The bullet tears through your shoulder." |
| Item obtained | "You carefully pocket the old keycard." |

This separation is required for:

- deterministic behaviour
- multiplayer consistency
- AI narration
- multiple user interfaces

---

# High-Level Architecture

```
Player
    │
    ▼
Interface
(CLI / Discord / Website / AI)
    │
    ▼
Command / Intent Parser
    │
    ▼
Action Dispatcher
    │
    ▼
Simulation Systems
    │
    ▼
Persistence
```

Only the engine modifies permanent game state.

---

# Layer Responsibilities

## Interface

Responsible for communicating with players.

Examples:

- CLI
- Discord
- Website
- AI narrator

Responsibilities:

- receive input
- display output

Interfaces never directly change persistent state.

---

## Command / Intent Layer

Current implementation:

- CLI commands

Future implementation:

- AI intent parser

Both should produce the same structured engine actions.

Example:

```
Player:

Open the old crate.

↓

Engine Action

{
    type: "open",
    target: "alley_crate"
}
```

The parser interprets intent.

The engine determines the result.

---

## Action Dispatcher

The dispatcher coordinates game actions.

Responsibilities:

- route actions
- coordinate systems
- validate interactions
- save modified entities
- return structured results

The dispatcher should not become a large collection of game rules.

Repeated logic should be extracted into systems.

---

## Systems

Systems implement game rules.

Examples include:

- inventory
- movement
- time
- weather
- containers
- combat
- dialogue
- quests

Systems answer questions such as:

- Can this happen?
- What changes?
- What events are generated?

Systems should not know how data is stored.

---

## Managers

Managers perform persistence.

Responsibilities:

- load
- save
- find
- replace

Managers should never decide whether an action is allowed.

Changing from JSON to SQLite should primarily affect managers.

---

## Persistence

Current storage:

- JSON

Future:

- SQLite
- PostgreSQL

The simulation should not require significant changes when persistence changes.

---

# Simulation

The world exists independently of players.

Time passes.

Weather changes.

NPCs move.

Shops open.

Rent becomes due.

Deliveries arrive.

Players observe only what they are present to witness.

---

# Scheduler

The scheduler is the long-term driver of simulation.

Anything that happens because time passes should eventually become a scheduled event.

Examples:

- NPC movement
- shop opening
- deliveries
- meetings
- phone calls
- faction actions
- story events

Avoid hardcoded clock checks whenever possible.

---

# World Objects

Locations contain generic world objects.

Examples:

- containers
- doors
- terminals
- elevators
- vehicles
- beds
- vending machines

Object type determines behaviour.

This avoids creating separate architectures for every interactable object.

---

# Entity Resolution

The engine stores IDs.

Players use names.

The resolver translates player-facing language into engine identifiers.

Example:

```
Protein Bar

↓

protein_bar
```

Future AI intent parsing should reuse this system.

---

# Event Pipeline

Time advancement produces simulation events.

```
Advance Time
      │
      ▼
Simulation
      │
      ▼
Events
      │
      ▼
Presentation
```

Events should eventually contain structured data rather than narration.

Example:

```
{
    type: "shop_open",
    locationId: "market_square",
    data: {
        shopId: "kuroda_mart"
    }
}
```

The presentation layer determines how players experience the event.

---

# Multiplayer

The engine is authoritative.

Clients never decide permanent state.

Every player should observe the same world.

Different players may receive different information depending on:

- location
- visibility
- timing
- knowledge

---

# Future Interfaces

The architecture is intended to support:

- CLI
- Discord
- Website
- AI narration

without duplicating simulation logic.

---

# Architectural Test

Before writing code, ask:

**What responsibility does this feature have?**

If it:

- changes world state → Engine
- stores data → Manager
- applies rules → System
- coordinates systems → Dispatcher
- communicates with players → Presentation

Maintaining these boundaries is more important than any individual feature.