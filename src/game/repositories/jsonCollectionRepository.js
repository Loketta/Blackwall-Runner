const {
  createJsonFileRepository
} = require("./jsonFileRepository");

function createJsonCollectionRepository(options) {
  validateOptions(options);

  const fileRepository = createJsonFileRepository({
    filePath: options.filePath,
    indentation: options.indentation
  });

  const idProperty = options.idProperty ?? "id";

  function loadAll() {
    const entities = fileRepository.load();

    if (!Array.isArray(entities)) {
      throw new TypeError(
        "JSON collection repository must contain an array."
      );
    }

    return entities;
  }

  function saveAll(entities) {
    if (!Array.isArray(entities)) {
      throw new TypeError(
        "JSON collection repository can only save an array."
      );
    }

    return fileRepository.save(entities);
  }

  function loadById(entityId) {
    return loadAll().find(function (entity) {
      return entity[idProperty] === entityId;
    });
  }

  function update(updatedEntity) {
    validateEntity(updatedEntity);

    const entities = loadAll();

    const entityIndex = entities.findIndex(function (entity) {
      return entity[idProperty] === updatedEntity[idProperty];
    });

    if (entityIndex === -1) {
      return false;
    }

    entities[entityIndex] = updatedEntity;
    saveAll(entities);

    return true;
  }

  function validateEntity(entity) {
    if (!entity || typeof entity !== "object") {
      throw new TypeError(
        "Updated collection entity must be an object."
      );
    }

    if (
      entity[idProperty] === undefined ||
      entity[idProperty] === null ||
      entity[idProperty] === ""
    ) {
      throw new TypeError(
        `Updated collection entity requires "${idProperty}".`
      );
    }
  }

  return {
    loadAll,
    saveAll,
    loadById,
    update
  };
}

function validateOptions(options) {
  if (!options || typeof options !== "object") {
    throw new TypeError(
      "Collection repository options must be an object."
    );
  }

  if (
    typeof options.filePath !== "string" ||
    options.filePath.trim() === ""
  ) {
    throw new TypeError(
      "Collection repository filePath must be a non-empty string."
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
      "Collection repository idProperty must be a non-empty string."
    );
  }
}

module.exports = {
  createJsonCollectionRepository
};
