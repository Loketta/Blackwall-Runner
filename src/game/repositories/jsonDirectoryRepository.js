const fs = require("fs");
const path = require("path");

function createJsonDirectoryRepository(options) {
  validateOptions(options);

  const directoryPath = path.resolve(
    options.directoryPath
  );

  const idProperty = options.idProperty ?? "id";
  const indentation = options.indentation ?? 2;

  function getEntityPath(entityId) {
    validateEntityId(entityId);

    return path.join(
      directoryPath,
      `${entityId}.json`
    );
  }

  function load(entityId) {
    const filePath = getEntityPath(entityId);

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

  function save(entity) {
    validateEntity(entity);

    const filePath = getEntityPath(
      entity[idProperty]
    );

    let fileData;

    try {
      fileData = JSON.stringify(
        entity,
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

    return entity;
  }

  function exists(entityId) {
    return fs.existsSync(
      getEntityPath(entityId)
    );
  }

  function validateEntity(entity) {
    if (!entity || typeof entity !== "object") {
      throw new TypeError(
        "Directory repository entity must be an object."
      );
    }

    if (
      entity[idProperty] === undefined ||
      entity[idProperty] === null ||
      entity[idProperty] === ""
    ) {
      throw new TypeError(
        `Directory repository entity requires "${idProperty}".`
      );
    }
  }

  return {
    load,
    save,
    exists
  };
}

function validateOptions(options) {
  if (!options || typeof options !== "object") {
    throw new TypeError(
      "Directory repository options must be an object."
    );
  }

  if (
    typeof options.directoryPath !== "string" ||
    options.directoryPath.trim() === ""
  ) {
    throw new TypeError(
      "Directory repository directoryPath must be a non-empty string."
    );
  }

  if (
    options.idProperty !== undefined &&
    (
      typeof options.idProperty !== "string" ||
      options.idProperty.trim() === ""
    )
  ) {
    throw new TypeError(
      "Directory repository idProperty must be a non-empty string."
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
      "Directory repository indentation must be a non-negative integer."
    );
  }
}

function validateEntityId(entityId) {
  if (
    typeof entityId !== "string" ||
    entityId.trim() === ""
  ) {
    throw new TypeError(
      "Directory repository entity ID must be a non-empty string."
    );
  }

  if (
    entityId.includes("/") ||
    entityId.includes("\\") ||
    entityId.includes("..")
  ) {
    throw new TypeError(
      "Directory repository entity ID contains invalid path characters."
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
  createJsonDirectoryRepository
};
