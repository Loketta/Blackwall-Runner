"use strict";

class ActionContext {
  constructor({ player, action, services = {} }) {
    if (
      services === null ||
      typeof services !== "object" ||
      Array.isArray(services)
    ) {
      throw new TypeError("services must be an object.");
    }

    this.player = player;
    this.action = action;
    this.services = Object.freeze({ ...services });

    Object.freeze(this);
  }
}

module.exports = {
  ActionContext
};
