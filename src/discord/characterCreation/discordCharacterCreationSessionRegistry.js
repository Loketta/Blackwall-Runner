"use strict";

function requireNonEmptyString(
  value,
  fieldName
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }

  return value.trim();
}

function requireFunction(
  value,
  fieldName
) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }

  return value;
}

function createSessionKey({
  guildId,
  channelId,
  ownerId
}) {
  const normalisedGuildId =
    requireNonEmptyString(
      guildId,
      "guildId"
    );

  const normalisedChannelId =
    requireNonEmptyString(
      channelId,
      "channelId"
    );

  const normalisedOwnerId =
    requireNonEmptyString(
      ownerId,
      "ownerId"
    );

  return [
    normalisedGuildId,
    normalisedChannelId,
    normalisedOwnerId
  ].join(":");
}

function createDiscordCharacterCreationSessionRegistry({
  createSession
}) {
  const sessionFactory =
    requireFunction(
      createSession,
      "createSession"
    );

  const sessions = new Map();

  function has(input) {
    const key = createSessionKey(input);

    return sessions.has(key);
  }

  function get(input) {
    const key = createSessionKey(input);

    return sessions.get(key) ?? null;
  }

  function start(input) {
    const key = createSessionKey(input);

    if (sessions.has(key)) {
      throw new Error(
        "A Discord character creation session already exists for this user in this channel."
      );
    }

    const session =
      sessionFactory({
        guildId:
          requireNonEmptyString(
            input.guildId,
            "guildId"
          ),
        channelId:
          requireNonEmptyString(
            input.channelId,
            "channelId"
          ),
        ownerId:
          requireNonEmptyString(
            input.ownerId,
            "ownerId"
          )
      });

    if (
      !session ||
      typeof session !== "object"
    ) {
      throw new TypeError(
        "createSession must return an object."
      );
    }

    sessions.set(key, session);

    return session;
  }

  function getOrStart(input) {
    const existing = get(input);

    if (existing) {
      return Object.freeze({
        created: false,
        session: existing
      });
    }

    return Object.freeze({
      created: true,
      session: start(input)
    });
  }

  function remove(input) {
    const key = createSessionKey(input);
    const session =
      sessions.get(key) ?? null;

    if (!session) {
      return null;
    }

    sessions.delete(key);

    return session;
  }

  function clear() {
    sessions.clear();
  }

  function size() {
    return sessions.size;
  }

  return Object.freeze({
    has,
    get,
    start,
    getOrStart,
    remove,
    clear,
    size
  });
}

module.exports = {
  createDiscordCharacterCreationSessionRegistry,
  createSessionKey
};
