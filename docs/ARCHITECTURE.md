# Blackwall Runner Architecture

Blackwall Runner is a persistent, genre-neutral tabletop RPG simulation engine designed for solo and multiplayer campaigns.

The engine separates player intention, mechanical truth, world consequence and narrative presentation so that AI can support play without becoming the authority over game state.

## Core principles

- Player owns intention.
- Engine owns truth.
- World owns consequence.
- AI owns presentation.

## High-level architecture

    Player
      ?
    Interface
      ?
    Intent Parser
      ?
    Dispatcher
      ?
    Action Registry
      ?
    Action Module
      ?
    Simulation Engine
      ?
    Time, Events and Persistence
      ?
    Presentation

Rulesets, settings, content policies and presentation packages are selected by the campaign and remain separate from the core engine.

## Repository documentation

### Project direction

- [Vision](VISION.md)
- [Roadmap](ROADMAP.md)

### Core technical documents

- [Core Architecture](engine/core-architecture.md)
- [Action System](engine/action-system.md)
- [Simulation Engine](engine/simulation-engine.md)
- [Persistence](engine/persistence.md)
- [Scheduler](engine/scheduler.md)
- [Multiplayer](engine/multiplayer.md)

### Product and system design

- [Modular Engine](design/modular-engine.md)
- [Content Safety](design/content-safety.md)
- [Rulesets](design/rulesets.md)
- [Campaign Flow](design/campaign-flow.md)
- [Spatial Modes](design/spatial-modes.md)
- [Character Creation](design/character-creation.md)
- [Simulation System](design/simulation-system.md)

### Supporting references

- [Command Flow](COMMAND_FLOW.md)
- [Data Model](DATA_MODEL.md)
- [Player Agency](PLAYER_AGENCY.md)

### Architecture decisions

- [Architecture Decision Records](adr/README.md)

## Current development phase

Blackwall Runner is currently transitioning from a monolithic dispatcher into a modular action system.

Completed action extractions include:

- Wait
- Look
- Inventory
- Move
- Talk
- Open container
- Take from container
- Drop
- Drop into container

The next architectural phase will introduce:

1. ActionContext
2. Standard ActionResult
3. Action Registry
4. Simulation-aware actions

## Reading order

New contributors should read the documentation in this order:

1. [VISION.md](VISION.md)
2. [ARCHITECTURE.md](ARCHITECTURE.md)
3. [ROADMAP.md](ROADMAP.md)
4. [Core Architecture](engine/core-architecture.md)
5. [Action System](engine/action-system.md)
6. Relevant design documents
7. Architecture Decision Records

## Architectural direction

The core engine must remain independent from any single genre, setting or intellectual property.

Campaigns will eventually select modular packages for:

- Ruleset
- Setting
- Content Safety Profile
- Presentation
- Spatial Mode

Theatre-of-the-mind play remains the first implementation target. Zone-based positioning and tactical battlemaps may be added later without changing which system owns spatial truth.
