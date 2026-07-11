# Persistence

Persistence stores authoritative campaign, world, player and entity state.

The persistence layer should remain separate from action handling and presentation.

Current development uses JSON-backed storage.

Future persistence implementations may include:

- Database-backed storage
- Transactional updates
- Save migrations
- Multiplayer-safe locking
- Backups and recovery
- Versioned schemas

Game systems should interact with persistence through repositories and managers rather than editing storage files directly.
