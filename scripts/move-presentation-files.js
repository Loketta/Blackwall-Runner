const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const gameDirectory = path.join(projectRoot, "src", "game");
const presentationDirectory = path.join(gameDirectory, "presentation");

const filesToMove = [
  "eventPresenter.js",
  "locationDescriber.js"
];

function ensureDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(
      `Created: ${path.relative(projectRoot, directoryPath)}`
    );
  }
}

function moveFile(fileName) {
  const sourcePath = path.join(gameDirectory, fileName);
  const destinationPath = path.join(
    presentationDirectory,
    fileName
  );

  if (!fs.existsSync(sourcePath)) {
    if (fs.existsSync(destinationPath)) {
      console.log(`Already moved: ${fileName}`);
      return;
    }

    throw new Error(`Source file not found: ${sourcePath}`);
  }

  if (fs.existsSync(destinationPath)) {
    throw new Error(
      `Destination already exists: ${destinationPath}`
    );
  }

  fs.renameSync(sourcePath, destinationPath);
  console.log(`Moved: src/game/${fileName}`);
}

function getJavaScriptFiles(directoryPath) {
  const entries = fs.readdirSync(directoryPath, {
    withFileTypes: true
  });

  return entries.flatMap(function (entry) {
    const entryPath = path.join(directoryPath, entry.name);

    if (
      entry.isDirectory() &&
      entry.name !== "node_modules" &&
      entry.name !== ".git"
    ) {
      return getJavaScriptFiles(entryPath);
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      return [entryPath];
    }

    return [];
  });
}

function updateImportPaths() {
  const replacements = new Map([
    [
      'require("./eventPresenter")',
      'require("./presentation/eventPresenter")'
    ],
    [
      "require('./eventPresenter')",
      "require('./presentation/eventPresenter')"
    ],
    [
      'require("./locationDescriber")',
      'require("./presentation/locationDescriber")'
    ],
    [
      "require('./locationDescriber')",
      "require('./presentation/locationDescriber')"
    ]
  ]);

  const files = getJavaScriptFiles(
    path.join(projectRoot, "src")
  );

  for (const filePath of files) {
    let contents = fs.readFileSync(filePath, "utf8");
    let updatedContents = contents;

    for (const [oldImport, newImport] of replacements) {
      updatedContents = updatedContents.replaceAll(
        oldImport,
        newImport
      );
    }

    if (updatedContents !== contents) {
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

function updateMovedFileImports() {
  const movedFiles = filesToMove.map(function (fileName) {
    return path.join(presentationDirectory, fileName);
  });

  for (const filePath of movedFiles) {
    let contents = fs.readFileSync(filePath, "utf8");

    contents = contents.replaceAll(
      'require("./managers/',
      'require("../managers/'
    );

    contents = contents.replaceAll(
      "require('./managers/",
      "require('../managers/"
    );

    contents = contents.replaceAll(
      'require("./systems/',
      'require("../systems/'
    );

    contents = contents.replaceAll(
      "require('./systems/",
      "require('../systems/"
    );

    fs.writeFileSync(filePath, contents);

    console.log(
      `Updated moved-file imports: ${path.relative(
        projectRoot,
        filePath
      )}`
    );
  }
}

function runMigration() {
  ensureDirectory(presentationDirectory);

  for (const fileName of filesToMove) {
    moveFile(fileName);
  }

  updateImportPaths();
  updateMovedFileImports();

  console.log("");
  console.log("Presentation migration complete.");
}

try {
  runMigration();
} catch (error) {
  console.error("");
  console.error("Migration failed:");
  console.error(error.message);
  process.exitCode = 1;
}