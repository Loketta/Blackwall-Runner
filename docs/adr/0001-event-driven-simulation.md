# ADR-0001: Use an Event-Driven Simulation

**Status:** Accepted

**Date:** 12 July 2026

## Context

Blackwall Runner requires a persistent simulated world capable of supporting complete campaign memory, hidden information, delayed consequences, contextual time, NPC schedules, background simulation, deterministic player-facing mechanics, AI-generated activity, designer direction and administrative intervention.

Minor occurrences may become important much later.

Directly coupling actions to narration or manually scripting every consequence would make these systems difficult to maintain and reuse.

## Decision

Blackwall Runner will use an event-driven simulation architecture.

An event represents anything that happened within or affected the simulated world, whether immediately visible or significant.

Accepted events are immutable factual records.

Events may create further event candidates.

Each candidate must be validated against current world state before becoming accepted truth.

The engine owns accepted truth.

The AI may propose plausible events and narrate accepted outcomes, but it may not directly mutate authoritative state.

Background activity may be resolved narratively while it remains outside player-relevant mechanical focus.

Deterministic rules apply when players become directly involved.

Only player actions advance shared world time.

Scheduled events are processed when player actions cause sufficient in-world time to pass.

## Information Boundaries

What happened is separate from who observed it, who knows it and what may be presented.

Hidden checks and failed passive checks remain persistent facts.

## NPC Persistence

NPCs use two classifications:

- ephemeral;
- persistent.

Ephemeral NPCs may be promoted in place when player interaction, plot relevance or administrative direction requires continued existence.

Promotion preserves identity and event history.

## Campaign Control

Player preferences guide campaign generation.

Designer directives privately influence narrative planning without directly changing established truth.

Administrative interventions may create validated and audited state amendments.

## Alternatives Considered

### Actions directly mutate and narrate outcomes

Rejected because it couples mechanics to individual actions and presentation layers.

### AI directly controls world state

Rejected because it weakens determinism, auditability, player agency and long-term consistency.

### Record only significant events

Rejected because later significance may not be known when an occurrence happens.

### Fully deterministic background simulation

Rejected because resolving every background entity mechanically would create unnecessary complexity.

### Narrative-only simulation

Rejected because player-relevant outcomes require reliable rules and persistent consequences.

## Consequences

### Positive

- complete causal history;
- hidden and delayed consequences;
- reusable presentation across interfaces;
- support for scheduled and interruptible processes;
- clear AI authority boundaries;
- replay, debugging and audit support;
- persistent cross-character and cross-group consequences;
- decoupled simulation systems.

### Negative

- larger persistent histories;
- more schemas and validation rules;
- increased testing requirements;
- risk of recursive event chains;
- need for event indexing and selective retrieval;
- need to define transitions between narrative and deterministic resolution.

## Required Safeguards

The implementation must eventually support:

- immutable accepted events;
- unique event identifiers;
- causal links;
- validation;
- transactional mutation;
- information visibility controls;
- duplicate protection where appropriate;
- event-chain termination safeguards;
- administrative audit history;
- selective history retrieval.

## Related Documentation

- [Event Pipeline](../engine/event-pipeline.md)
- [Simulation Engine](../engine/simulation-engine.md)
- [Action System](../engine/action-system.md)
