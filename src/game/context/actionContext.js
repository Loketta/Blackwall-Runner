class ActionContext {
  constructor({ player, action }) {
    this.player = player;
    this.action = action;

    Object.freeze(this);
  }
}

module.exports = {
  ActionContext
};
