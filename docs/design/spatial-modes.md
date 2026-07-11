# Spatial Modes

Blackwall Runner should support progressively more detailed spatial simulation.

## Level 1 — Theatre of the Mind

Actors occupy locations. Distance and positioning are described narratively.

## Level 2 — Zone-Based Positioning

Locations contain connected zones such as entrances, cover positions and rooms.

## Level 3 — Tactical Grid

Actors occupy grid coordinates. The engine may calculate:

- Distance
- Movement cost
- Adjacency
- Line of sight
- Cover
- Area effects
- Occupied spaces

The engine owns spatial truth.

A battlemap is a presentation of that truth and must not become the authoritative source of game state.
