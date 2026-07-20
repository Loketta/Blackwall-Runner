# Blackwall Runner - Codex Handover

Version: 1.0
Purpose: Initial onboarding document for Codex
Authoritative for: Development workflow, project philosophy and current milestone.

---

# Project Overview

Blackwall Runner is not simply a game.

It is a persistent tabletop RPG engine whose long-term goal is to support multiple genres while maintaining a strict separation between simulation, game logic and presentation.

The project intentionally avoids shortcuts that make future expansion difficult.

Long-term maintainability is valued more highly than short-term speed.

The health of the project always takes priority over fixing an isolated bug as quickly as possible.

---

# Core Philosophy

These principles are considered architectural rules rather than preferences.

## Player owns intention

Players choose actions.

The engine never invents player intentions.

## Engine owns truth

The engine determines what objectively happened.

Presentation cannot alter simulation state.

## World owns consequence

NPCs, factions, locations and time evolve according to the simulation.

Consequences are persistent.

## AI owns presentation

The AI narrates events.

It does not determine simulation outcomes.

It does not modify world state.

---

# Architectural Principles

The architecture intentionally separates responsibilities.

Presentation:

- Discord
- CLI
- Future Website

↓

Application Services

↓

Game Actions

↓

Simulation Engine

↓

Persistent World

↓

Presentation Pipeline

↓

Narration

No presentation layer may mutate game state.

---

# Long Term Goals

The engine is intended to support:

- Discord
- CLI
- Website
- Printable TTRPG
- Multiple game genres

Nothing should be implemented in a way that prevents those goals.

---

# Development Philosophy

This section is extremely important.

Previous development sessions demonstrated that many small "working" shortcuts caused architectural damage.

Future work should follow these rules.

## 1. Architecture first

Never bypass architecture to fix an individual bug.

If the architecture suggests a different solution than a quick patch:

follow the architecture.

## 2. Read before editing

Never assume surrounding code.

Always inspect the real implementation before making changes.

Never invent helper object structures.

Never infer interfaces.

## 3. Small commits

Every commit should represent one logical change.

## 4. Preserve existing behaviour

A bug fix should not silently change unrelated behaviour.

Regression prevention is mandatory.

## 5. Tests drive confidence

Relevant test suites should pass after every logical change.

## 6. Prefer real implementations

If a helper already exists:

use it.

Do not recreate synthetic versions.

---

# Lessons Learned

Never fabricate test fixtures.

Read the exact implementation before modifying.

Avoid speculative fixes.

Every edit should solve a demonstrated problem.

---

# Repository Philosophy

Code should remain:

- readable
- modular
- testable
- genre-neutral

Avoid duplication.

Avoid hidden coupling.

Avoid presentation-specific logic leaking into the engine.

---

# Character Creation

Current implementation includes:

✓ Identity

✓ Attributes

✓ Skills

✓ Profession

✓ Profession Choices

✓ Review

✓ Finalisation

CLI implementation complete.

Discord implementation mostly complete.

---

# Current Milestone

Complete Discord character creation so a player can finish the entire workflow without assistance.

---

# Current Issue

The Review stage remains the current blocker.

Previous attempts failed because synthetic profession-choice fixtures did not match the real implementation.

Future work should inspect the actual profession-choice builders before modifying tests.

---

# Discord Principles

Discord is a presentation layer.

Business logic belongs elsewhere.

Discord renders state.

It does not create state.

---

# Coding Standards

Follow existing project style.

Avoid introducing new patterns without architectural justification.

Maintain naming consistency.

Keep functions focused.

Avoid deep nesting.

---

# Testing Workflow

For every logical change:

1. Read relevant implementation.
2. Modify one logical unit.
3. Run relevant unit tests.
4. Fix failures immediately.
5. Commit.
6. Continue.

Avoid batching unrelated edits.

---

# Git Workflow

Preferred workflow:

Feature branch

↓

One logical commit

↓

Run tests

↓

Review diff

↓

Merge

---

# Development Workflow

Inspect

↓

Understand

↓

Modify

↓

Test

↓

Commit

↓

Repeat

Avoid modifying many systems before validating.

---

# Success Criteria

Each session should leave the repository healthier than before.

Avoid temporary hacks.

Avoid architecture debt.

Avoid speculative abstractions.

Every change should improve long-term maintainability.

---

# Guidance For Codex

When implementing changes:

1. Read the existing implementation.
2. Understand the architecture.
3. Make the smallest correct change.
4. Keep commits focused.
5. Preserve project philosophy.

If uncertain, inspect more code rather than assuming missing behaviour.
