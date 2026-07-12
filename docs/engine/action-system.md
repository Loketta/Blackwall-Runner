# Action System

The Action System converts structured player intentions into validated mechanical outcomes.

## Intended flow

Player input ? Intent Parser ? Dispatcher ? Action Registry ? Action Module ? Simulation Engine ? Persistence ? Presentation

## Action modules

Each action module should own one clear responsibility.

Examples include:

- Look
- Move
- Wait
- Inventory
- Talk
- Open container
- Take item
- Drop item

## Future ActionContext

All actions should eventually receive a single context object containing:

- campaign
- player
- action
- ruleset
- setting
- content policy
- spatial state
- engine services

Initially, only `player` and `action` need to be populated.

## Future ActionResult

All actions should return a standard result containing:

- success
- message
- data

Later additions may include:

- elapsedMinutes
- significance
- notifications
- scheduledEvents

## Events and Presentation

Actions receive a standardised `ActionContext` and return a standardised `ActionResult`.

Actions may cause structured simulation events.

Actions do not own narrative presentation.

```text
Player intention
        ↓
ActionContext
        ↓
Action
        ↓
Simulation and events
        ↓
ActionResult
        ↓
Presentation
```

The engine establishes what happened.

Presentation describes accepted truth without changing it.

See [Event Pipeline](event-pipeline.md).
