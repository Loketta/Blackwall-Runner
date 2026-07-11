class ActionResult {
  constructor({
    success,
    message,
    data = {},
    elapsedMinutes
  }) {
    this.success = success;
    this.message = message;
    this.data = data;

    if (elapsedMinutes !== undefined) {
      this.elapsedMinutes = elapsedMinutes;
    }

    Object.freeze(this);
  }
}

module.exports = {
  ActionResult
};
