# Persistent Worlds

## Purpose

This document defines the intended persistent-world philosophy for Blackwall Runner.

It records design intent rather than locking in a final directory structure, repository interface or database schema.

The central principle is:

> A persistent world is the primary unit of continuity.

Campaigns are chapters within worlds. Sessions are periods of play within campaigns. Characters, NPCs, locations, events and consequences belong to their world.

---

## Core Principles

- Player owns intention.
- Engine owns truth.
- World owns consequence.
- AI owns presentation.
- Persistent worlds are isolated from one another.
- Campaigns update their parent world's live state.
- Characters are permanently bound to the world in which they were created.
- The engine simulates meaningful consequences rather than background trivia.
- Important NPCs remember significant player actions.
- Established canon may be extended but must not be silently rewritten.
- Administrators maintain and repair worlds rather than acting as Game Masters.
- Player characters remain part of world history after death or retirement.

---

## Setting Templates

Blackwall Runner begins with an authored setting template.

The template contains the default starting state of the city or wider setting, including:

- starting calendar date and time;
- authored locations;
- authored NPCs;
- factions;
- shops;
- containers;
- items;
- world objects;
- setting rules;
- default environmental and social conditions.

The setting template is not modified by gameplay.

Creating a new world produces an independent world instance derived from that template.

---

## Persistent World Instances

Every world instance has its own:

- mutable world state;
- current in-game date and time;
- NPC state;
- location state;
- shop state;
- container contents;
- world objects;
- event history;
- graveyard;
- characters;
- campaigns;
- consequences.

An event in one world must never modify another world.

If players destroy a building in one world, that building remains intact in every unrelated world unless it is independently destroyed there.

Players starting a game may either:

1. continue an existing persistent world; or
2. create a fresh world from the default setting template.

Continuing a world preserves all previous consequences.

Creating a fresh world returns to the authored starting state and starting date.

---

## World Identity

Every persistent world must have:

- an immutable world ID;
- a required human-readable name;
- a setting ID;
- a play mode;
- a creation timestamp;
- a current in-game date and time.

World names must be unique within the installation or hosted service.

Name comparisons should ignore casing and leading or trailing whitespace.

For example, these names conflict:

```text
Neon Shallows
neon shallows
 Neon Shallows
```

The world ID is the authoritative reference.

The world name is the primary player-facing identifier and should also appear in graveyard records.

### Player-Facing World Summary

World identity should remain concise.

Players should normally see:

- world name;
- current in-game date;
- active-character count;
- retired-character count;
- deceased-character count;
- campaigns completed;
- current campaign status.

Detailed factual state remains available to the engine without becoming interface noise.

Summary counts should be derived from authoritative records where practical.

---

## World Lifecycle

The intended lifecycle is:

```text
Create World
    ↓
Choose Setting
    ↓
Configure World Rules
    ↓
Create First Campaign
    ↓
Register Starting Players
    ↓
Create Starting Characters
    ↓
Collect Player World Contributions
    ↓
Collect Player Campaign Preferences
    ↓
Generate Campaign
    ↓
Complete Party Setup
    ↓
Begin First Session
    ↓
Play Sessions
    ↓
Conclude Campaign
    ↓
Continue World with a New Campaign
or
Leave World Dormant
or
Archive World
```

A newly created world must not become playable until its first campaign and starting party are complete.

Starting characters must have their backgrounds, mechanics and place in the party established before they enter the active world.

Players should see an in-world calendar date rather than an abstract label such as `Day 42`.

The engine may still use elapsed minutes or elapsed days internally for scheduling and simulation.

### Possible World States

Possible lifecycle states include:

- `creating`
- `configuring`
- `awaiting_characters`
- `ready`
- `active`
- `dormant`
- `archived`

These names are design guidance rather than a locked implementation schema.

---

## Campaigns

Campaigns are nested beneath their parent world.

A campaign does not own a separate copy of world reality.

All gameplay during a campaign writes directly to the parent world's live state.

Later campaigns in the same world inherit:

- the current in-game date;
- altered or destroyed locations;
- NPC deaths and movements;
- faction state;
- shop state;
- items left in the world;
- unresolved consequences;
- event history;
- graveyard records;
- eligible retired characters who became NPCs.

A world may contain many campaigns over its lifetime, but only one campaign may remain unconcluded at a time.

A new campaign may be created only after the previous campaign has concluded.

### Campaign Conclusion

A campaign may conclude through:

1. completion of the story;
2. unanimous agreement from all active human players;
3. administrator intervention.

Without unanimous player agreement, only an administrator may force a conclusion.

Administrative conclusions should be reserved for:

- abandoned campaigns;
- inaccessible players;
- moderation problems;
- corrupted campaign state;
- game-breaking faults.

Administrative intervention should include a reason and an audit record.

Possible campaign statuses include:

- `planned`
- `active`
- `paused`
- `completed`
- `ended_by_consent`
- `ended_by_admin`
- `abandoned`

Only terminal states permit another campaign to be created in the same world.

---

## Sessions

A session is one actual period of play within a campaign.

```text
World
    ↓
Campaign
    ↓
Session
```

Ending a session does not conclude the campaign.

Concluding a campaign does not reset or delete the world.

A later session resumes the same campaign state.

A later campaign resumes the same world state.

---

## Player Identity

Players are identified through their host platform.

Examples include:

```text
discord:<user-id>
web:<account-id>
```

A future account-linking system may associate multiple host identities with one internal player identity.

Campaign votes count human players rather than characters.

Creating another character must never create an additional campaign vote.

---

## Active Character Limits

In a multiplayer world, each human user may control only one active character at a time.

A player may have one active character in several different worlds:

```text
Player
    ├── World A → Character A
    ├── World B → Character B
    └── World C → Character C
```

The limit is one active character per player per world.

This prevents abuse involving:

- duplicated starting resources;
- inventory transfers through disposable characters;
- additional campaign votes;
- expendable scouting characters;
- avoidance of reputation and consequences;
- occupation of several party roles by one human player.

A player whose character dies keeps their campaign participation and voting rights while creating a replacement.

---

## Single-Player Worlds

World creation may support:

- `multiplayer`
- `single_player`

A single-player world is permanently restricted to its owner.

The initial implementation may retain the same one-active-character limit used in multiplayer.

A future optional mode may allow one human player to control up to three characters.

That feature is deferred because it requires additional design for:

- time advancement;
- currently controlled character;
- party following;
- split parties;
- inventory ownership;
- dialogue ownership;
- combat turns;
- inactive party behaviour.

---

## Starting Character Creation

The first campaign cannot begin until every registered player has one complete starting character.

The starting party must have identities, backgrounds and motivations before stepping into the active world.

Character creation should establish:

- name and identity;
- background;
- role or archetype;
- attributes and skills;
- starting equipment;
- personal motivations;
- important relationships;
- relevant prior history;
- reason for joining the campaign;
- initial location;
- connection to the starting party.

The AI may help develop and present these details.

Accepted character facts become deterministic world truth.

The AI may narrate those facts but must not casually rewrite them.

Characters should distinguish incomplete drafts from playable records.

A minimal lifecycle may use:

- `draft`
- `ready`
- `active`

The campaign should become active only when:

1. every registered player has one ready character;
2. every character belongs to the world;
3. no player controls more than one active character;
4. all required party setup is complete;
5. accepted starting details have been validated.

Beginning the campaign should create a deterministic `CampaignStarted` event.

---

## Character World Binding

A character is permanently associated with the world in which they were created.

An existing character may be continued only when that same world state is continued.

They may not move into:

- a fresh world;
- another group's world;
- another independent copy of the same setting.

This prevents contradictions involving:

- memories;
- relationships;
- equipment;
- advancement;
- injuries;
- discoveries;
- personal consequences;
- world history.

A newly created character may join an existing world at any point because they have no previous history requiring reconciliation.

This supports:

- late-joining players;
- replacement characters after death;
- replacement characters after retirement;
- new campaigns in an existing world.

The same character concept may be recreated in a fresh world, but it is a completely new character identity with no inherited history.

---

## Character Lifecycle

The intended lifecycle is:

```text
Draft
    ↓
Ready
    ↓
Active
    ↓
Retired or Deceased
    ↓
Historical Record
```

Player characters should not normally be deleted.

Death and retirement end player control but preserve the character's place in world history.

---

## Character Death

Death is permanent in the current cyberpunk ruleset.

A deceased character:

- remains bound to the world;
- becomes permanently unplayable;
- remains in campaign records;
- creates a graveyard entry;
- frees the player's active-character slot.

The player may then create a replacement character in the same world.

Resurrection is not available in the current cyberpunk setting.

The same character concept may still be recreated as a new identity in a fresh world.

---

## Digital Graveyard

Each persistent world owns a graveyard record for player characters who die there.

The minimum player-facing record contains:

- character name;
- world name;
- in-game date of death;
- cause of death.

Internally, the record should also retain stable identifiers such as:

- death-record ID;
- character ID;
- world ID;
- campaign ID;
- location ID where relevant;
- structured cause code where relevant.

The graveyard file is authoritative.

Presentation hosts may use the same death event to produce:

- a post in a dedicated Discord graveyard channel;
- a website graveyard or death-history page;
- a temporary live news ticker on the website.

Discord posts and website displays are presentations of the engine record. They do not own the truth.

The cause of death should be grounded in deterministic engine facts rather than invented by narration.

---

## Character Retirement

A player may permanently retire their own active character.

Retirement must:

- be initiated explicitly by the controlling player;
- display a clear irreversible-action warning;
- require a second confirmation;
- require an exact confirmation phrase;
- permanently prevent the character returning to active play;
- free the player's active-character slot.

Retirement is not a temporary character-switching mechanism.

A retired character remains part of the world's history.

---

## Retired Characters as World NPCs

An eligible retired character may become an NPC in their existing world.

This requires explicit player consent during retirement.

The option is available only when the character has survived for at least 20 in-game days.

The exact threshold may later become configurable, but its purpose is to prevent players rapidly creating and retiring characters to flood the world with known NPCs.

If the player declines consent:

- the character remains retired;
- the character remains part of world history;
- the engine must not use them as an active NPC.

If the player grants consent:

- the player permanently gives up control;
- the character may be converted into a persistent NPC;
- established identity and history remain protected;
- the NPC may appear in later campaigns in the same world.

Retired characters should not automatically become major quest figures.

Their later importance should emerge naturally.

---

## Legacy Character Nomination

A particularly long-lived retired character may become eligible for nomination as an official setting NPC.

A possible threshold is 100 in-game days alive, although the final number is not yet fixed.

Eligibility does not guarantee acceptance.

The player must explicitly opt into nomination.

The engine should generate a concise legacy dossier containing grounded facts such as:

- character name;
- world name;
- role;
- lifetime in world days;
- campaigns participated in;
- important achievements;
- important relationships;
- retirement date;
- concise story summary;
- player consent.

The dossier should be sent privately for human review through a private Discord channel, email or administration interface.

Approval remains manual.

Review should consider:

- originality;
- quality of the story;
- setting compatibility;
- tone;
- copyright concerns;
- whether the character would enrich the default world.

Approved legacy NPCs should be maintained as curated content layered onto the authored setting.

They should not directly overwrite the original setting template.

New worlds created after the approved content is released may include those legacy NPCs by default.

---

## Player World Contributions

Before the first campaign begins, each registered player may be offered limited opportunities to contribute to that world.

Each player is asked independently:

```text
Would you like to add an NPC to the world?
YES / NO
```

If they choose yes, they may provide:

- a short description;
- personality;
- occupation or role;
- relationship to their player character;
- why the NPC matters.

The AI may expand this into a validated NPC record without contradicting the player's stated intent.

Each player is then asked:

```text
Would you like to add a notable location?
YES / NO
```

If they choose yes, they may describe:

- a building;
- landmark;
- business;
- meeting place;
- notable area.

The AI may expand the description into a location for that specific world.

The default city remains the authored baseline.

Player contributions add to the world rather than replacing established content.

The initial limit is:

- no more than one contributed NPC per player;
- no more than one contributed location per player;
- each contribution may be skipped independently.

These limits reduce flooding and abuse while giving every player a personal connection to the world.

---

## Player Campaign Preferences

During character and world setup, each player should be asked for a short description of the type of game they would like to play.

Examples include:

- action;
- investigation;
- intrigue;
- mystery;
- horror;
- espionage;
- crime;
- heists;
- survival;
- exploration;
- social drama;
- corporate warfare.

Players may provide more than one preference.

The AI should use all player preferences as guidance during campaign generation.

Preferences influence the campaign but do not rigidly dictate it.

The AI should attempt to provide opportunities aligned with each player's preferences while maintaining one coherent campaign.

---

## Party Setup

After individual character creation and world contribution, the party should receive a brief setup phase.

This may establish:

- whether the characters already know one another;
- why they are together;
- their starting location;
- shared knowledge;
- shared resources;
- any recognised party leader;
- the opening premise.

This prevents the first session from beginning with unrelated characters who have no reason to cooperate.

---

## AI Authority During Campaign Generation

The AI has broad creative authority while preparing a campaign.

It may propose:

- the overarching conflict;
- major antagonists;
- supporting NPCs;
- locations needed by the story;
- items, clues and evidence;
- factions or organisations;
- multiple investigative routes;
- optional encounters;
- breadcrumbs;
- escalation conditions;
- consequences if threats are ignored.

It may connect established world content to the new story.

For example, it may decide that:

- an established NPC knows a relevant contact;
- an existing shop received a suspicious shipment;
- an existing warehouse is being used by an antagonist;
- an established faction has an interest in the conflict.

The AI should create a situation containing actors, goals, clues and consequences rather than a rigid sequence of mandatory scenes.

---

## Protected World Canon

The AI may extend established world facts but must not casually contradict them.

Existing entities should have protected facts such as:

- identity;
- established history;
- core personality;
- occupation;
- known faction;
- confirmed relationships;
- previous campaign events.

The AI may build on those facts.

It may not arbitrarily rewrite them.

For example, an established friendly shopkeeper from previous campaigns must not suddenly become a secret elite corporate assassin without prior evidence and a valid recorded cause.

The default rule is:

> AI authority is additive rather than revisionist.

The AI may propose new developments around established canon.

It may not silently replace established canon.

---

## AI Authority During Play

Once play begins, AI authority becomes narrower.

The AI may:

- narrate established facts;
- portray NPC dialogue;
- describe immediate reactions;
- present validated clues;
- generate prose around mechanical outcomes;
- request minor additions when needed.

The AI may not:

- decide player actions;
- override mechanical outcomes;
- create major world facts without validation;
- change established NPC identities;
- force clues into the players' path;
- require players to follow the prepared plot;
- protect the intended story from player consequences.

During play, the AI reacts rather than directs.

The engine remains the sole authority over world truth.

---

## Breadcrumbs and Player Freedom

Campaign generation should create several independent ways to discover important information.

If the players ignore every breadcrumb, the plot advances without them.

The AI must not continually move the same clue into whichever location the players choose.

Antagonists and factions continue pursuing their goals.

Deadlines may pass.

Opportunities may disappear.

The campaign changes according to player choices and consequences.

---

## NPC Persistence

NPC persistence should remain deliberately lightweight.

The engine does not need to simulate every part of every NPC's daily life.

NPC details should expand only when:

- they become relevant to the plot;
- players interact with them meaningfully;
- players push the narrative in a direction where additional detail matters;
- world-changing consequences require an update.

The guiding principle is:

> Simulate consequences, not trivia.

A destroyed building matters.

A murdered official matters.

A retired player character becoming an NPC matters.

A random NPC's breakfast normally does not.

---

## NPC Memory

Important NPCs remember significant interactions with player characters.

The game should keep the heroes at the centre of the story.

Important NPCs should not diminish player significance by arbitrarily forgetting them.

Memory does not decay merely because time passes.

Relationships and opinions change only when players do something that justifies the change.

The engine should distinguish:

- memories: facts about what happened;
- relationships: how the NPC currently feels.

A later betrayal may change a relationship while preserving the earlier memory.

---

## Knowledge

Knowledge should remain simple and event-driven.

Events may be classified broadly as:

- personal;
- local;
- regional;
- major or public.

A major event is something that large numbers of people could reasonably see, hear or learn through ordinary public information.

People living in the affected town or city may be assumed to know it.

A minor event, such as a shop burglary, is known only locally by:

- direct participants;
- witnesses;
- nearby residents or workers;
- people within a reasonable distance;
- relevant organisations.

Organisational exceptions apply.

For example:

- a reported crime may be known throughout the police department;
- an internal corporate event may be known by relevant corporate staff;
- a gang incident may be known by members of that gang.

The engine should determine whether an NPC would reasonably know an event rather than simulate detailed rumour propagation.

The guiding principle is:

> Distribute knowledge by reason, not by background simulation.

---

## Reputation

Reputation has two levels.

### Faction Reputation

A faction holds a broad opinion of the player party as a whole.

Examples include:

- police department;
- corporation;
- gang;
- government body;
- community organisation.

The player party is treated as its own faction for this purpose.

Faction reputation belongs to the persistent world and carries across campaigns.

It changes through meaningful party actions rather than trivial interactions.

### Individual NPC Relationships

Important NPCs may hold their own opinions of individual player characters.

An NPC's personal experience may:

- reinforce faction reputation;
- soften faction hostility;
- balance a negative faction opinion to neutrality;
- create conflict between personal loyalty and organisational duty.

For example, a police faction may dislike the party while one officer remains friendly towards a particular character.

The system should remain descriptive rather than exposing raw numbers.

Possible states include:

- trusted;
- friendly;
- neutral;
- suspicious;
- hostile;
- enemy;
- conflicted.

Faction reputation provides the broad default.

Individual relationships provide meaningful exceptions.

---

## Campaign Archives

Automated historical encyclopaedias and community lore are deferred.

The game should preserve deterministic records required for continuity, including:

- event history;
- campaigns;
- character outcomes;
- graveyard entries;
- retired characters;
- world state.

When a campaign concludes, the AI may generate a concise campaign summary for records.

The summary must:

- remain grounded in recorded events;
- avoid inventing history;
- respect a configured maximum length;
- initially remain below approximately 3,000 words.

Community lore, historic buildings and universally recognised major events may later be developed with direct community input and human curation.

The engine should not automatically promote campaign events into official setting canon.

---

## Administration

Blackwall Runner is not designed around a human Game Master.

The engine and AI run the game.

The administrator acts as a custodian of the platform.

Players are responsible for:

- their own character actions;
- story interactions;
- retirement decisions;
- NPC-conversion consent;
- legacy submissions;
- campaign-conclusion votes.

The administrator should normally avoid interfering in player worlds.

Administrative action is reserved for:

- game-breaking faults;
- corrupted state;
- moderation;
- abandoned campaigns;
- inaccessible players;
- required repairs;
- necessary migrations.

The administrator should have broad authority when intervention is genuinely required.

Possible powers include:

- pausing a world;
- repairing state;
- concluding a campaign;
- removing an inactive or abusive player;
- correcting inventory or currency;
- moving a stuck NPC;
- triggering a missed event;
- editing weather or time when repairing faults;
- restoring or migrating world data.

Administrative actions should be audited.

Material interventions should include a reason.

The administrator maintains worlds rather than creating stories inside them.

---

## Initial Permission Model

### Player

May:

- control their own active character;
- participate in the story;
- vote on campaign conclusion;
- retire their own character;
- grant or deny NPC-conversion consent;
- opt into legacy nomination.

### World Owner

May eventually:

- invite players;
- manage session access;
- request campaign conclusion;
- perform limited organisational actions.

The world owner should not receive simulation-editing or cheating powers.

### Administrator

May perform any required repair, moderation or maintenance operation.

Administrative authority should be broad but rarely exercised.

---

## Implementation Direction

The persistence implementation should distinguish:

```text
Setting Template
    ↓ creates
Persistent World
    ↓ contains
Campaigns
    ↓ contain
Sessions
```

Characters belong to the persistent world rather than to one campaign.

World-owned state includes:

- calendar and time;
- NPCs;
- locations;
- shops;
- containers;
- world objects;
- events;
- graveyard;
- characters;
- campaigns.

The final storage layout is not yet locked.

The implementation should avoid hard-coding a character-specific save model that would conflict with world-owned persistence.

---

## Summary

Blackwall Runner begins with an authored setting.

Players enrich a new world through:

- starting characters;
- optional contributed NPCs;
- optional contributed locations;
- campaign preferences.

The AI then generates a campaign using:

- the authored setting;
- established world canon;
- player contributions;
- player preferences;
- validated new content.

During campaign generation, the AI has broad additive authority.

During active play, the AI primarily narrates and reacts.

The engine protects world truth.

The persistent world records meaningful consequences and carries them across campaigns.
