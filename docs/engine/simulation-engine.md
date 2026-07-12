# Simulation Engine

The Simulation Engine owns world progression and mechanical consequence.

Its responsibilities include:

- Advancing world time
- Validating elapsed time
- Processing scheduled events
- Applying background simulation
- Coordinating persistent world changes
- Producing authoritative mechanical results

Only player actions advance the shared timeline.

NPCs do not independently advance time. They consume elapsed time and perform scheduled activity as the players advance the world.

## Event-Driven Simulation

The Simulation Engine produces and processes structured events.

Actions may advance time, mutate validated state and create event candidates.

Accepted events may schedule or trigger further events.

Background activity may be resolved narratively while it remains outside player-relevant mechanical focus.

When players become directly involved, applicable deterministic rules take authority.

Only player actions advance shared world time.

Scheduled events remain pending until player actions cause sufficient in-world time to pass.

See [Event Pipeline](event-pipeline.md).
