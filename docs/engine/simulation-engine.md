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
