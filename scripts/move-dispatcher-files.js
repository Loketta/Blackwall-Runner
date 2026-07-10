const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const srcDirectory = path.join(projectRoot, "src");
const gameDirectory = path.join(srcDirectory, "game");
const dispatcherDirectory = path.join(
  gameDirectory,
  "dispatcher"
);

const sourcePath = path.join(
  gameDirectory,
  "actionDispatcher.js"
);

const destinationPath = path.join(
  dispatcherDirectory,
  "actionDispatcher.js"
);

function getJavaScriptFiles(directoryPath) {
  return fs.readdirSync(directoryPath, {
    withFileTypes: true
  }).flatMap(function (entry) {
    const entryPath = path.join(
      directoryPath,
      entry.name
    );

    if (entry.isDirectory()) {
      return getJavaScriptFiles(entryPath);
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".js")
    ) {
      return [entryPath];
    }

    return [];
  });
}

function moveDispatcher() {
  fs.mkdirSync(dispatcherDirectory, {
    recursive: true
  });

  console.log("Created: src\\game\\dispatcher");

  if (!fs.existsSync(sourcePath)) {
    if (fs.existsSync(destinationPath)) {
      console.log(
        "Already moved: actionDispatcher.js"
      );
      return;
    }

    throw new Error(
      "Source file not found: " +
      "src/game/actionDispatcher.js"
    );
  }

  if (fs.existsSync(destinationPath)) {
    throw new Error(
      "Destination already exists: " +
      "src/game/dispatcher/actionDispatcher.js"
    );
  }

  fs.renameSync(sourcePath, destinationPath);

  console.log(
    "Moved: src/game/actionDispatcher.js -> " +
    "src/game/dispatcher/actionDispatcher.js"
  );
}

function updateExternalImports() {
  const replacements = [
    [
      "../../game/actionDispatcher",
      "../../game/dispatcher/actionDispatcher"
    ],
    [
      "../game/actionDispatcher",
      "../game/dispatcher/actionDispatcher"
    ],
    [
      "./game/actionDispatcher",
      "./game/dispatcher/actionDispatcher"
    ],
    [
      "./actionDispatcher",
      "./dispatcher/actionDispatcher"
    ]
  ];

  const files = getJavaScriptFiles(srcDirectory);

  for (const filePath of files) {
    if (filePath === destinationPath) {
      continue;
    }

    const originalContents = fs.readFileSync(
      filePath,
      "utf8"
    );

    let updatedContents = originalContents;

    for (const [oldPath, newPath] of replacements) {
      updatedContents = updatedContents.replaceAll(
        oldPath,
        newPath
      );
    }

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

function updateDispatcherImports() {
  let contents = fs.readFileSync(
    destinationPath,
    "utf8"
  );

  contents = contents
    .replaceAll(
      'require("./',
      'require("../'
    )
    .replaceAll(
      "require('./",
      "require('../"
    );

  fs.writeFileSync(destinationPath, contents);

  console.log(
    "Updated moved-file imports: " +
    "src/game/dispatcher/actionDispatcher.js"
  );
}

try {
  moveDispatcher();
  updateExternalImports();
  updateDispatcherImports();

  console.log("");
  console.log(
    "Dispatcher-layer migration complete."
  );
} catch (error) {
  console.error("");
  console.error("Migration failed:");
  console.error(error.message);
  process.exitCode = 1;
}
