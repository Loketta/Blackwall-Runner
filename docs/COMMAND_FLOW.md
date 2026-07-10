# Blackwall Runner Command Flow

Version: 0.1.x Alpha

---

# Purpose

This document describes how player intent flows through the Blackwall Runner engine.

The architecture is designed so that every interface—CLI, Discord, web, or AI—ultimately produces the same structured engine actions.

Only the way player intent is interpreted changes.

The engine remains identical.

---

# High-Level Flow

```
Player
    │
    ▼
Interface
    │
    ▼
Intent Parser
    │
    ▼
Action Dispatcher
    │
    ▼
Simulation Systems
    │
    ▼
Persistence
    │
    ▼
Engine Result
    │
    ▼
Presentation Layer
    │
    ▼
Player
```

Every action should pass through this pipeline.

No interface should bypass the engine.

---

# Step 1 — Player Intent

Players express **intent**, not implementation.

Examples:

```
Open the crate.

Talk to Finch.

Look around.

Buy a drink.

Sit down.

Wait for half an hour.
```

The player should never need to know how the engine internally performs these actions.

---

# Step 2 — Intent Parsing

The interface converts player intent into a structured action.

Current implementation:

CLI commands

Future implementation:

- AI intent parser
- Discord slash commands
- Website interface

Example:

Player says:

```
Open the old crate.
```

Intent becomes:

```json
{
    "type": "open",
    "target": "alley_crate"
}
```

This action is now independent of the interface.

---

# Step 3 — Action Dispatcher

The dispatcher receives a structured action.

Responsibilities:

- coordinate systems
- validate requests
- resolve entities
- trigger simulation
- save persistent changes
- return structured results

The dispatcher coordinates.

It should not permanently become the home for game rules.

---

# Step 4 — Entity Resolution

Players use natural language.

The engine uses IDs.

Example:

```
Protein Bar

↓

protein_bar
```

Entity resolution translates between them.

Current supported entities include:

- items
- NPCs
- containers

Future support:

- world objects
- shops
- vehicles
- quests
- factions
- districts

Entity resolution never changes the world.

It only identifies what the player meant.

---

# Step 5 — Simulation Systems

Systems determine what actually happens.

Examples:

Movement System

- Can the player move?
- Where do they arrive?

Inventory System

- Can the item be added?
- Can it be removed?

Container System

- Does the object contain the item?

Time System

- Advance world time.

Scheduler

- What events should occur?

Every system should perform one area of responsibility well.

---

# Step 6 — Persistence

Once an action succeeds:

Managers save the affected entities.

Example:

```
Player opens crate

↓

Container state changes

↓

Container saved
```

Example:

```
Player buys item

↓

Player inventory changes

↓

Shop stock changes

↓

Player saved

↓

Shop saved
```

Persistence should occur after successful validation.

---

# Step 7 — Engine Result

The engine returns a structured result.

Current example:

```json
{
    "success": true,
    "message": "You open Alley Crate.",
    "data": {
        "objectId": "alley_crate"
    }
}
```

Long-term goal:

```json
{
    "success": true,
    "events": [
        {
            "type": "container_opened",
            "locationId": "back_alley_1",
            "data": {
                "objectId": "alley_crate"
            }
        }
    ]
}
```

The engine returns facts.

Not narration.

---

# Step 8 — Presentation

Presentation converts engine results into player-facing output.

Example engine event:

```json
{
    "type": "shop_open",
    "locationId": "market_square"
}
```

Possible presentation:

```
The battered shutters of Kuroda Mart grind open.

A tired shopkeeper steps outside and switches on the neon sign.
```

Another interface could instead show:

```
[Kuroda Mart has opened.]
```

The engine does not care.

---

# Time-Based Actions

Some actions advance time.

Example:

```
Wait 30 minutes.
```

Pipeline:

```
Advance Time

↓

Scheduler

↓

Simulation

↓

Events Generated

↓

Presentation
```

Multiple world events may occur from one player action.

For example:

```
Player waits.

↓

Weather changes.

↓

Shop opens.

↓

NPC arrives.

↓

Rent becomes due.

↓

Player receives all relevant events.
```

---

# Multiplayer Flow

Every player shares the same simulation.

Example:

```
Player A waits.

↓

Time advances.

↓

NPC moves.

↓

Shop opens.

↓

Player B later enters the district.

↓

Player B sees the updated world.
```

The world changes once.

Players observe those changes based on where they are.

---

# AI Integration

The AI should eventually replace only two parts of the pipeline:

```
Player

↓

AI Intent Parser

↓

Engine

↓

AI Narrator

↓

Player
```

The AI should never directly decide:

- inventory
- combat
- quests
- NPC movement
- money
- time
- persistent world state

Those remain engine responsibilities.

---

# Design Rules

Every new action should follow the same structure.

1. Parse intent.
2. Resolve entities.
3. Validate rules.
4. Apply simulation.
5. Save changes.
6. Return structured results.
7. Present the outcome.

Keeping every interaction inside this pipeline ensures that:

- all interfaces behave identically
- multiplayer remains deterministic
- AI narration stays consistent
- game logic remains testable

The engine should always answer the question:

> **"What happened?"**

The presentation layer should answer:

> **"How do we tell the player?"**