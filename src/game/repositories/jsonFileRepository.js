const fs = require("fs");
const path = require("path");

function createJsonFileRepository(options) {
  validateOptions(options);

  const filePath = path.resolve(options.filePath);
  const indentation = options.indentation ?? 2;

  function load() {
    let fileData;

    try {
      fileData = fs.readFileSync(filePath, "utf8");
    } catch (error) {
      throw createRepositoryError(
        "read",
        filePath,
        error
      );
    }

    try {
      return JSON.parse(fileData);
    } catch (error) {
      throw createRepositoryError(
        "parse",
        filePath,
        error
      );
    }
  }

  function save(value) {
    let fileData;

    try {
      fileData = JSON.stringify(
        value,
        null,
        indentation
      );
    } catch (error) {
      throw createRepositoryError(
        "serialise",
        filePath,
        error
      );
    }

    try {
      fs.writeFileSync(filePath, fileData);
    } catch (error) {
      throw createRepositoryError(
        "write",
        filePath,
        error
      );
    }

    return value;
  }

  return {
    load,
    save
  };
}

function validateOptions(options) {
  if (!options || typeof options !== "object") {
    throw new TypeError(
      "Repository options must be an object."
    );
  }

  if (
    typeof options.filePath !== "string" ||
    options.filePath.trim() === ""
  ) {
    throw new TypeError(
      "Repository filePath must be a non-empty string."
    );
  }

  if (
    options.indentation !== undefined &&
    (
      !Number.isInteger(options.indentation) ||
      options.indentation < 0
    )
  ) {
    throw new TypeError(
      "Repository indentation must be a non-negative integer."
    );
  }
}

function createRepositoryError(
  operation,
  filePath,
  originalError
) {
  const error = new Error(
    `Could not ${operation} JSON repository file ` +
    `"${filePath}": ${originalError.message}`
  );

  error.cause = originalError;

  return error;
}

module.exports = {
  createJsonFileRepository
};
