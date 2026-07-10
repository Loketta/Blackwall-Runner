# Blackwall Runner Player Agency

Version: 0.1.x Alpha

---

# Purpose

This document defines the boundaries between the Player, the Engine, the AI Game Master, and the simulated World.

These boundaries are considered one of the fundamental design principles of Blackwall Runner.

Whenever a new feature is designed, it should be evaluated against the rules in this document.

If a feature violates player agency, it should be redesigned.

---

# The Four Authorities

Blackwall Runner is built around four independent authorities.

Each has responsibilities that should never be silently assumed by another.

```
Player

↓

Intent

↓

Engine

↓

World

↓

AI Narration

↓

Player
```

Each authority owns different decisions.

---

# Player Authority

The player owns their character.

Only the player decides what their character intentionally attempts.

The AI must never invent voluntary player actions.

The engine must never invent voluntary player actions.

Examples of player-owned decisions include:

- movement
- conversation
- attacks
- purchases
- accepting jobs
- refusing jobs
- using equipment
- revealing information
- lying
- threatening
- fleeing
- surrendering
- helping others
- searching
- resting

The player also owns:

- thoughts
- intentions
- emotions
- personality
- moral choices

Unless explicitly requested, neither the engine nor the AI should narrate these.

---

# The Engine's Authority

The engine owns objective truth.

It determines:

- whether actions are possible
- mechanical outcomes
- inventory
- combat
- damage
- health
- credits
- locations
- schedules
- persistent world state
- simulation rules

The engine never decides what the player intended.

It only determines what happens because of those intentions.

---

# The World's Authority

The world exists independently of both the player and the AI.

Time passes.

Weather changes.

NPCs move.

Businesses open.

Rent becomes due.

Deliveries arrive.

Factions make decisions.

The world should continue evolving even if the players remain inactive.

The player reacts to the world.

The world does not wait for the player.

---

# The AI Game Master's Authority

The AI acts as the Game Master.

It owns:

- narration
- atmosphere
- pacing
- NPC dialogue
- NPC personality
- sensory description
- dramatic presentation

The AI may create new story opportunities.

The AI may create new NPCs.

The AI may introduce complications.

The AI may decide how NPCs respond.

The AI may describe consequences.

The AI must not invent player choices.

---

# Player Intent

Players declare intent.

Not outcomes.

Example:

```
I try to kick the door open.
```

The player has declared an attempt.

The engine determines whether the door opens.

The AI narrates the result.

---

# Acceptable Inference

The AI may infer insignificant details required to perform an action.

Example:

Player:

```
I sit down.
```

Acceptable narration:

```
You pull out one of the nearby chairs and sit.
```

No meaningful decision has been added.

---

Another example:

Player:

```
I look around.
```

Acceptable narration:

```
You slowly scan the room from left to right.
```

Again, no meaningful decision has been added.

---

# Unacceptable Inference

The AI must never add meaningful voluntary actions.

Player:

```
I enter the building.
```

Unacceptable:

```
You draw your pistol before entering.
```

The player never chose to draw their weapon.

---

Player:

```
I speak to Finch.
```

Unacceptable:

```
You accuse Finch of lying.
```

The player never chose that approach.

---

Player:

```
I search the desk.
```

Unacceptable:

```
You also take the money from the drawer.
```

Taking an item is a separate decision.

---

# Ambiguity

When player intent is ambiguous, the AI should prefer clarification over assumption.

Example:

```
I head over there.
```

If multiple destinations exist:

The AI should ask.

Not guess.

---

If the ambiguity is insignificant:

Player:

```
I walk to the counter.
```

The AI may reasonably choose the exact path taken.

---

# Consequences

Player agency does not protect players from consequences.

If the player chooses an action, the world may react naturally.

Example:

Player:

```
I punch the security guard.
```

Possible consequences:

- combat
- alarms
- witnesses
- reputation loss
- arrest

These are world consequences.

Not violations of player agency.

---

# Hidden Information

The AI should never reveal information that the player's character could not reasonably know.

Examples include:

- NPC thoughts
- secret plans
- hidden enemies
- future events
- unrevealed quest information

Unless a mechanic explicitly grants that knowledge.

---

# Multiplayer

Each player owns only their own character.

One player cannot decide another player's actions.

The AI should never merge player intentions together.

Group actions should only occur when:

- every affected player agrees

or

- an agreed group leader makes the decision.

---

# Internal Thoughts

The AI should avoid narrating a player's internal thoughts unless the player has previously established them or explicitly invites such narration.

Good:

```
Your pulse quickens as the room falls silent.
```

Poor:

```
You realise you never trusted Finch.
```

That is the player's decision.

---

# Action Resolution

Every action follows the same structure.

```
Player Intent

↓

Validation

↓

Simulation

↓

Consequences

↓

Narration
```

Player agency exists only at the beginning.

Consequences belong to the world.

Narration belongs to the AI.

---

# Guiding Principle

Blackwall Runner should feel like sitting at a table with an experienced Game Master.

A good Game Master never tells players what their characters choose.

A good Game Master tells players what happens because of those choices.

Blackwall Runner should follow the same principle.

The player owns intention.

The engine owns truth.

The world owns consequence.

The AI owns presentation.