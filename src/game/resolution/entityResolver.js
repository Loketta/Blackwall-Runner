const { loadItems } = require("../managers/itemManager");
const { loadNpcs } = require("../managers/npcManager");
const { loadContainers } = require("../managers/containerManager");

function normaliseInput(input) {
  return input.trim().toLowerCase();
}

function resolveItem(input) {
  const items = loadItems();
  const search = normaliseInput(input);

  return items.find(function (item) {
    return (
      item.id.toLowerCase() === search ||
      item.name.toLowerCase() === search
    );
  });
}

function resolveNpc(input) {
  const npcs = loadNpcs();
  const search = normaliseInput(input);

  return npcs.find(function (npc) {
    return (
      npc.id.toLowerCase() === search ||
      npc.name.toLowerCase() === search
    );
  });
}

function resolveContainer(input) {
  const containers = loadContainers();
  const search = normaliseInput(input);

  return containers.find(function (container) {
    return (
      container.id.toLowerCase() === search ||
      container.name.toLowerCase() === search
    );
  });
}

module.exports = {
  resolveItem,
  resolveNpc,
  resolveContainer
};