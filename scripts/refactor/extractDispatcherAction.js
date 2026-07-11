const fs = require("fs");

function fail(message) {
  console.error(`Refactor failed: ${message}`);
  process.exit(1);
}

function findMatchingBrace(content, openingBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = openingBraceIndex; index < content.length; index++) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
      }

      continue;
    }

    if (blockComment) {
      if (character === "*" && nextCharacter === "/") {
        blockComment = false;
        index++;
      }

      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === "\\") {
        escaped = true;
        continue;
      }

      if (character === quote) {
        quote = null;
      }

      continue;
    }

    if (character === "/" && nextCharacter === "/") {
      lineComment = true;
      index++;
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      blockComment = true;
      index++;
      continue;
    }

    if (
      character === '"' ||
      character === "'" ||
      character === "`"
    ) {
      quote = character;
      continue;
    }

    if (character === "{") {
      depth++;
      continue;
    }

    if (character === "}") {
      depth--;

      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return -1;
}

function insertImport(content, importStatement) {
  if (content.includes(importStatement)) {
    return content;
  }

  const actionImportPattern =
    /^const .*require\("\.\.\/actions\/[^"]+"\);[^\S\r\n]*(?:\r?\n|$)/gm;

  const imports = [...content.matchAll(actionImportPattern)];

  if (imports.length === 0) {
    fail("Could not locate an existing action import.");
  }

  const lastImport = imports[imports.length - 1];
  const insertionPoint = lastImport.index + lastImport[0].length;

  return (
    content.slice(0, insertionPoint) +
    `${importStatement}\n` +
    content.slice(insertionPoint)
  );
}

function extractActionBranch({
  dispatcherPath,
  actionType,
  importStatement,
  replacementCall
}) {
  let content = fs.readFileSync(dispatcherPath, "utf8");

  content = insertImport(content, importStatement);

  const escapedActionType = actionType.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const branchPattern = new RegExp(
    `if\\s*\\(\\s*action\\.type\\s*===\\s*"${escapedActionType}"\\s*\\)\\s*\\{`
  );

  const branchMatch = branchPattern.exec(content);

  if (!branchMatch) {
    fail(`Could not locate the "${actionType}" action branch.`);
  }

  const branchStart = branchMatch.index;
  const openingBrace = content.indexOf("{", branchStart);
  const branchEnd = findMatchingBrace(content, openingBrace);

  if (branchEnd === -1) {
    fail(`Could not find the closing brace for "${actionType}".`);
  }

  const lineStart = content.lastIndexOf("\n", branchStart - 1) + 1;
  const indentation = content.slice(lineStart, branchStart);

  const replacement =
    `if (action.type === "${actionType}") {\n` +
    `${indentation}  return ${replacementCall};\n` +
    `${indentation}}`;

  content =
    content.slice(0, branchStart) +
    replacement +
    content.slice(branchEnd);

  fs.writeFileSync(dispatcherPath, content, "utf8");
}

const [
  actionType,
  importSymbol,
  modulePath,
  replacementCall
] = process.argv.slice(2);

if (
  !actionType ||
  !importSymbol ||
  !modulePath ||
  !replacementCall
) {
  fail(
    "Usage: node extractDispatcherAction.js " +
    "<actionType> <importSymbol> <modulePath> <replacementCall>"
  );
}

extractActionBranch({
  dispatcherPath: "src/game/dispatcher/actionDispatcher.js",
  actionType,
  importStatement:
    `const { ${importSymbol} } = require("${modulePath}");`,
  replacementCall
});

console.log(`Extracted dispatcher branch: ${actionType}`);
