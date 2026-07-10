# Blackwall Runner Development Roadmap

Version: 0.1.x Alpha

---

# Purpose

This document describes the long-term direction of Blackwall Runner.

It is not intended to be a fixed checklist.

As the project grows, priorities will change, systems will evolve, and better solutions will be discovered.

This document exists to ensure that future development continues to move toward the same vision.

---

# Long-Term Goal

Blackwall Runner aims to become a persistent multiplayer RPG simulation engine capable of supporting AI-driven tabletop roleplaying.

Players should eventually feel as though they are participating in a campaign run by an experienced human Game Master.

The engine maintains the world's truth.

The AI presents that truth.

---

# Development Philosophy

Every milestone should satisfy at least one of the following goals.

- Expand simulation.
- Improve architecture.
- Reduce technical debt.
- Improve maintainability.
- Increase flexibility.
- Improve multiplayer readiness.

Features should not be added simply because they are interesting.

Every feature should strengthen the engine.

---

# Current Stage

Current version:

```
0.1.x Alpha
```

Current focus:

Building the simulation foundation.

Current priorities:

- stable architecture
- deterministic behaviour
- reusable systems
- persistent data
- modular design

Gameplay depth is intentionally secondary while these foundations are being established.

---

# Development Phases

## Phase One

Simulation Foundation

Focus:

- persistence
- world state
- commands
- scheduling
- world objects
- architecture

Success means:

The world can exist independently of players.

---

## Phase Two

Living World

Focus:

- NPC schedules
- shops
- travel
- faction activity
- deliveries
- world simulation
- environmental interaction

Success means:

The world continues evolving even when players are inactive.

---

## Phase Three

Character Systems

Focus:

- attributes
- skills
- checks
- reputation
- equipment
- cyberware
- conditions

Success means:

Characters become mechanically distinct.

---

## Phase Four

Gameplay

Focus:

- combat
- quests
- dialogue
- exploration
- progression

Success means:

Complete adventures can be played entirely inside the engine.

---

## Phase Five

AI Integration

Focus:

- intent parsing
- narration
- contextual responses
- dialogue generation
- memory assembly

Success means:

Players no longer interact through commands.

Natural language becomes the primary interface.

---

## Phase Six

Multiplayer

Focus:

- shared persistence
- concurrent players
- networking
- permissions
- scalability

Success means:

Multiple players experience the same persistent world simultaneously.

---

# Architectural Priorities

Whenever multiple possible improvements exist, prefer work that strengthens architecture before adding gameplay features.

Examples include:

- reducing duplicated code
- improving system boundaries
- improving data ownership
- increasing modularity
- improving persistence abstraction

Strong architecture compounds.

Poor architecture compounds too.

---

# Planned Systems

These systems are expected to appear over the lifetime of the project.

Simulation

- scheduler
- weather
- economy
- rent
- faction simulation
- hunger
- fatigue
- travel

Characters

- NPC schedules
- combat
- dialogue
- quests
- relationships
- reputation

World

- vehicles
- housing
- districts
- random encounters
- mission generation
- environmental interaction

Infrastructure

- SQLite
- PostgreSQL
- Discord
- web interface
- AI narrator

The order may change as development continues.

---

# Decision Principles

When choosing between two solutions, prefer the one that:

- removes duplication
- increases reuse
- separates responsibilities
- improves testing
- improves multiplayer safety
- keeps the engine deterministic

Avoid solutions that tightly couple systems together.

---

# Refactoring Policy

Refactoring is a normal part of development.

Large architectural improvements should happen before they become expensive.

A milestone that improves architecture without adding visible gameplay is considered valuable.

---

# Version Philosophy

Version numbers represent architectural maturity rather than feature count.

Example progression:

```
0.1.x
Simulation foundation

0.2.x
Living world

0.3.x
Character systems

0.4.x
Gameplay systems

0.5.x
AI integration

0.6.x
Multiplayer

1.0.0
First complete playable release
```

Version numbers may change if development reveals better staging.

---

# Development Workflow

Every milestone should follow the same process.

1. Identify the architectural responsibility.
2. Design the solution.
3. Implement the smallest useful increment.
4. Test thoroughly.
5. Commit only after successful testing.
6. Push to GitHub.

Every commit should leave the repository in a working state.

---

# The Guiding Question

Before implementing any feature, ask:

> Does this improve the engine?

If the answer is no, reconsider the design.

If the answer is yes, determine where it belongs.

- Presentation
- Dispatcher
- System
- Manager
- Persistence

Maintaining these boundaries is more important than implementing features quickly.

The architecture should remain understandable even years into development.

That is the standard every new milestone should aim to preserve.