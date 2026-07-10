const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const srcDirectory = path.join(projectRoot, "src");
const gameDirectory = path.join(srcDirectory, "game");
const resolutionDirectory = path.join(gameDirectory, "resolution");

const sourcePath = path.join(gameDirectory, "entityResolver.js");
const destinationPath = path.join(
  resolutionDirectory,
  "entityResolver.js"
);

function getJavaScriptFiles(directoryPath) {
  return fs.readdirSync(directoryPath, {
    withFileTypes: true
  }).flatMap(function (entry) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return getJavaScriptFiles(entryPath);
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      return [entryPath];
    }

    return [];
  });
}

function moveResolver() {
  fs.mkdirSync(resolutionDirectory, {
    recursive: true
  });

  console.log("Created: src\\game\\resolution");

  if (!fs.existsSync(sourcePath)) {
    if (fs.existsSync(destinationPath)) {
      console.log("Already moved: entityResolver.js");
      return;
    }

    throw new Error(
      "Source file not found: src/game/entityResolver.js"
    );
  }

  if (fs.existsSync(destinationPath)) {
    throw new Error(
      "Destination already exists: " +
      "src/game/resolution/entityResolver.js"
    );
  }

  fs.renameSync(sourcePath, destinationPath);

  console.log(
    "Moved: src/game/entityResolver.js -> " +
    "src/game/resolution/entityResolver.js"
  );
}

function updateExternalImports() {
  const files = getJavaScriptFiles(srcDirectory);

  for (const filePath of files) {
    if (filePath === destinationPath) {
      continue;
    }

    const originalContents = fs.readFileSync(filePath, "utf8");

    const updatedContents = originalContents
      .replaceAll(
        'require("./entityResolver")',
        'require("./resolution/entityResolver")'
      )
      .replaceAll(
        "require('./entityResolver')",
        "require('./resolution/entityResolver')"
      )
      .replaceAll(
        "../../game/entityResolver",
        "../../game/resolution/entityResolver"
      )
      .replaceAll(
        "../game/entityResolver",
        "../game/resolution/entityResolver"
      )
      .replaceAll(
        "./game/entityResolver",
        "./game/resolution/entityResolver"
      );

    if (updatedContents !== originalContents) {
      fs.writeFileSync(filePath, updatedContents);

      console.log(
        `Updated imports: ${path.relative(
          projectRoot,
          filePath
        )}`
      );
    }
  }
}

function updateResolverImports() {
  let contents = fs.readFileSync(destinationPath, "utf8");

  contents = contents
    .replaceAll(
      'require("./managers/',
      'require("../managers/'
    )
    .replaceAll(
      "require('./managers/",
      "require('../managers/"
    )
    .replaceAll(
      'require("./systems/',
      'require("../systems/'
    )
    .replaceAll(
      "require('./systems/",
      "require('../systems/"
    );

  fs.writeFileSync(destinationPath, contents);

  console.log(
    "Updated moved-file imports: " +
    "src/game/resolution/entityResolver.js"
  );
}

try {
  moveResolver();
  updateExternalImports();
  updateResolverImports();

  console.log("");
  console.log("Resolution-layer migration complete.");
} catch (error) {
  console.error("");
  console.error("Migration failed:");
  console.error(error.message);
  process.exitCode = 1;
}
