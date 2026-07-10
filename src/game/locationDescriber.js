const { loadItem } = require("./itemManager");
const { loadNpc } = require("./npcManager");
const { loadShops } = require("./shopManager");
const { loadWorldObject } = require("./worldObjectManager");

function describeLocation(location) {
  console.log(location.name);
  console.log(location.description);

  const shops = loadShops().filter(function (shop) {
    return shop.locationId === location.id;
  });

  if (shops.length > 0) {
    console.log("");
    console.log("Shops:");

    for (const shop of shops) {
      const status = shop.isOpen ? "Open" : "Closed";
      console.log(`- ${shop.name} (${status})`);
    }
  }

  const npcIds = location.npcs || [];

  if (npcIds.length > 0) {
    console.log("");
    console.log("People:");

    for (const npcId of npcIds) {
      const npc = loadNpc(npcId);

      if (npc) {
        console.log(`- ${npc.name}`);
      } else {
        console.log(`- Unknown NPC (${npcId})`);
      }
    }
  }

  const itemIds = location.items || [];

  if (itemIds.length > 0) {
    console.log("");
    console.log("Items:");

    for (const itemId of itemIds) {
      const item = loadItem(itemId);

      if (item) {
        console.log(`- ${item.name}`);
      } else {
        console.log(`- Unknown Item (${itemId})`);
      }
    }
  }

  const objectIds = location.objects || [];
  const worldObjects = objectIds
    .map(loadWorldObject)
    .filter(Boolean);

  const containers = worldObjects.filter(function (worldObject) {
    return worldObject.type === "container";
  });

  if (containers.length > 0) {
    console.log("");
    console.log("Containers:");

    for (const container of containers) {
      console.log(`- ${container.name}`);
    }
  }

  const otherObjects = worldObjects.filter(function (worldObject) {
    return worldObject.type !== "container";
  });

  if (otherObjects.length > 0) {
    console.log("");
    console.log("Objects:");

    for (const worldObject of otherObjects) {
      console.log(`- ${worldObject.name}`);
    }
  }

  const exits = location.exits || [];

  if (exits.length > 0) {
    console.log("");
    console.log("Exits:");

    for (const exit of exits) {
      console.log(`- ${exit.name}: ${exit.description}`);
    }
  }
}

module.exports = {
  describeLocation
};