# Blackwall Runner Data Model

Version: 0.1.x Alpha

---

# Purpose

This document defines the persistent data used by the Blackwall Runner engine.

It describes **what information exists**, **who owns it**, and **where the authoritative source of truth lives**.

This is intentionally separate from implementation details.

Changing JSON to SQLite should not require rewriting this document.

---

# Design Principles

## Stable IDs

Every persistent entity has a permanent ID.

Example:

```
protein_bar
```

IDs never change once created.

Players should normally never see IDs.

---

## References

Persistent objects reference each other using IDs.

Example:

```
Player

location:
safehouse_1
```

not

```
Player

location:
{
    ...
}
```

Avoid duplicating mutable data.

---

## Single Source of Truth

Every piece of mutable information should have exactly one authoritative owner.

Good:

```
Player

location
```

Bad:

```
Player
    location

AND

Location
    players
```

Those two values will eventually disagree.

Always decide which object owns the truth.

---

# Current Entity Types

## World

The World represents global simulation state.

Current responsibilities:

- current time
- current day
- calendar
- weather
- scheduled events

Future responsibilities:

- economy
- faction simulation
- global incidents
- world flags
- news
- district conditions

There should only ever be one world.

---

## Player

Players represent persistent characters.

Current properties include:

- ID
- name
- location
- health
- credits
- inventory

Future properties may include:

- stats
- skills
- equipment
- conditions
- reputation
- housing
- quests
- hunger
- fatigue
- cyberware

The player owns:

- current inventory
- current location
- money

---

## NPC

NPCs represent persistent non-player characters.

Current properties include:

- ID
- name
- description
- dialogue

Future properties may include:

- current location
- schedule
- inventory
- faction
- health
- reputation
- relationships
- memory
- behaviour state

NPCs should eventually own their own location.

---

## Item

Items are reusable definitions.

Items describe what something is.

They do not represent ownership.

Example:

```
Protein Bar
```

Future properties may include:

- description
- weight
- value
- rarity
- durability
- stack size
- tags

Items should not know where they are.

---

## World Object

World Objects represent interactive things placed in the world.

Current examples:

- containers

Future examples:

- doors
- terminals
- generators
- vehicles
- beds
- vending machines
- elevators
- switches

Every World Object contains:

- ID
- type
- name
- description
- location
- state

Different object types extend this with their own data.

Example:

Container

- inventory

Door

- locked
- open

Vehicle

- fuel
- storage
- occupants

---

## Shop

Shops are persistent businesses.

Current properties:

- ID
- location
- stock
- prices
- open state

Future:

- owner
- opening schedule
- reputation requirements
- faction ownership
- buy modifiers
- sell modifiers

Shops should not determine their own opening hours.

The scheduler should.

---

# Relationships

```
World
 │
 ├── scheduled events
 ├── weather
 └── time

Player
 │
 ├── inventory
 └── location

NPC
 │
 ├── location
 └── dialogue

Location
 │
 ├── exits
 ├── loose items
 └── world objects

World Object
 │
 ├── location
 ├── state
 └── optional inventory

Shop
 │
 ├── location
 └── stock
```

---

# Inventories

Inventories are reusable collections.

Current owners include:

- players
- containers

Future owners:

- NPCs
- vehicles
- corpses
- lockers
- apartments

Inventories contain Item IDs.

The inventory system performs mutations.

---

# Locations

Locations describe physical places.

Current responsibilities:

- description
- exits
- loose items
- world objects

Locations should describe **what is fixed**.

They should avoid owning information about things that move.

---

# Scheduled Events

Scheduled events represent future changes.

They should contain structured data.

Example:

```
Shop opens

↓

{
    type: "shop_open",
    day: 4,
    time: "08:00",
    data: {
        shopId: "kuroda_mart"
    }
}
```

Presentation should not be stored inside events.

---

# Ownership Rules

The following table defines ownership.

| Data | Owner |
|--------|-------|
| Current time | World |
| Weather | World |
| Scheduled events | World |
| Player inventory | Player |
| Player credits | Player |
| NPC location | NPC *(future)* |
| Shop stock | Shop |
| World Object state | World Object |
| Container inventory | World Object |
| Loose items | Location |

When adding new systems, avoid creating duplicate ownership.

---

# Future Data

Planned persistent entities include:

- quests
- factions
- vehicles
- messages
- jobs
- districts
- encounters
- housing
- combat instances

These should follow the same principles:

- stable IDs
- single ownership
- references instead of duplication

---

# Data Philosophy

The data model should describe the world exactly once.

Everything else—

- AI narration
- Discord
- CLI
- websites

should simply observe or modify that model through the engine.

The data model is the foundation upon which every future system will be built.

## Persistent-World Data Ownership

The world is the primary unit of persistent ownership.

Characters are permanently bound to one world. Campaigns are nested beneath that world and update its live state rather than owning separate copies.

World-owned records include:

- world identity and calendar;
- characters;
- NPC state;
- locations;
- shops;
- containers;
- world objects;
- events;
- graveyard records;
- campaigns.

See `docs/design/PERSISTENT_WORLD_DESIGN.md`.
