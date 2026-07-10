const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const srcDirectory = path.join(projectRoot, "src");

const replacements = [
  [
    "../../game/locationDescriber",
    "../../game/presentation/locationDescriber"
  ],
  [
    "../../game/eventPresenter",
    "../../game/presentation/eventPresenter"
  ],
  [
    "../game/locationDescriber",
    "../game/presentation/locationDescriber"
  ],
  [
    "../game/eventPresenter",
    "../game/presentation/eventPresenter"
  ],
  [
    "./game/locationDescriber",
    "./game/presentation/locationDescriber"
  ],
  [
    "./game/eventPresenter",
    "./game/presentation/eventPresenter"
  ],
  [
    "./locationDescriber",
    "./presentation/locationDescriber"
  ],
  [
    "./eventPresenter",
    "./presentation/eventPresenter"
  ]
];

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

function repairImports() {
  const files = getJavaScriptFiles(srcDirectory);
  let updatedFileCount = 0;

  for (const filePath of files) {
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
      updatedFileCount += 1;

      console.log(
        `Updated: ${path.relative(projectRoot, filePath)}`
      );
    }
  }

  console.log("");
  console.log(
    `Repair complete. Updated ${updatedFileCount} file(s).`
  );
}

try {
  repairImports();
} catch (error) {
  console.error("");
  console.error("Repair failed:");
  console.error(error.message);
  process.exitCode = 1;
}
