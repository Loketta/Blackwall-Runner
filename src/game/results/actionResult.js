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

  static success(
    message,
    data = {},
    options = {}
  ) {
    return new ActionResult({
      success: true,
      message,
      data,
      elapsedMinutes: options.elapsedMinutes
    });
  }

  static failure(
    message,
    data = {}
  ) {
    return new ActionResult({
      success: false,
      message,
      data
    });
  }
}

module.exports = {
  ActionResult
};
