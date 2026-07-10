const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const srcDirectory = path.join(projectRoot, "src");
const gameDirectory = path.join(srcDirectory, "game");
const timeDirectory = path.join(gameDirectory, "time");

const filesToMove = [
  "calendarSystem.js",
  "timeSystem.js"
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
  const destinationPath = path.join(timeDirectory, fileName);

  if (!fs.existsSync(sourcePath)) {
    if (fs.existsSync(destinationPath)) {
      console.log(`Already moved: ${fileName}`);
      return;
    }

    throw new Error(
      `Source file not found: ${path.relative(
        projectRoot,
        sourcePath
      )}`
    );
  }

  if (fs.existsSync(destinationPath)) {
    throw new Error(
      `Destination already exists: ${path.relative(
        projectRoot,
        destinationPath
      )}`
    );
  }

  fs.renameSync(sourcePath, destinationPath);

  console.log(
    `Moved: src/game/${fileName} -> src/game/time/${fileName}`
  );
}

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

function updateProjectImports() {
  const replacements = [
    [
      "../../game/timeSystem",
      "../../game/time/timeSystem"
    ],
    [
      "../../game/calendarSystem",
      "../../game/time/calendarSystem"
    ],
    [
      "../game/timeSystem",
      "../game/time/timeSystem"
    ],
    [
      "../game/calendarSystem",
      "../game/time/calendarSystem"
    ],
    [
      "./game/timeSystem",
      "./game/time/timeSystem"
    ],
    [
      "./game/calendarSystem",
      "./game/time/calendarSystem"
    ],
    [
      "./timeSystem",
      "./time/timeSystem"
    ],
    [
      "./calendarSystem",
      "./time/calendarSystem"
    ]
  ];

  const files = getJavaScriptFiles(srcDirectory);

  for (const filePath of files) {
    if (filePath.startsWith(timeDirectory)) {
      continue;
    }

    const originalContents = fs.readFileSync(filePath, "utf8");
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

function updateMovedFileImports() {
  const timeSystemPath = path.join(
    timeDirectory,
    "timeSystem.js"
  );

  let contents = fs.readFileSync(timeSystemPath, "utf8");

  contents = contents.replaceAll(
    'require("./events/eventSystem")',
    'require("../events/eventSystem")'
  );

  contents = contents.replaceAll(
    "require('./events/eventSystem')",
    "require('../events/eventSystem')"
  );

  contents = contents.replaceAll(
    'require("./calendarSystem")',
    'require("./calendarSystem")'
  );

  contents = contents.replaceAll(
    "require('./calendarSystem')",
    "require('./calendarSystem')"
  );

  fs.writeFileSync(timeSystemPath, contents);

  console.log(
    "Updated moved-file imports: src/game/time/timeSystem.js"
  );
}

function runMigration() {
  ensureDirectory(timeDirectory);

  for (const fileName of filesToMove) {
    moveFile(fileName);
  }

  updateProjectImports();
  updateMovedFileImports();

  console.log("");
  console.log("Time-layer migration complete.");
}

try {
  runMigration();
} catch (error) {
  console.error("");
  console.error("Migration failed:");
  console.error(error.message);
  process.exitCode = 1;
}
