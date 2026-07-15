"use strict";

const fs = require("fs");
const path = require("path");
const {
  createJsonCollectionRepository
} = require("../repositories/jsonCollectionRepository");
const {
  getShopStateFilePath
} = require("../world/shopStatePaths");

const defaultSavesDirectory = path.resolve(
  __dirname,
  "../../../saves"
);

const savesDirectory =
  process.env.BLACKWALL_SAVES_DIRECTORY ||
  defaultSavesDirectory;

const shopStatePath = getShopStateFilePath({
  savesDirectory
});

const shopTemplatePath = path.resolve(
  __dirname,
  "../../../data/Shops/shops.json"
);

function seedShopStateIfMissing() {
  if (fs.existsSync(shopStatePath)) {
    return;
  }

  fs.mkdirSync(
    path.dirname(shopStatePath),
    { recursive: true }
  );

  fs.copyFileSync(
    shopTemplatePath,
    shopStatePath
  );
}

seedShopStateIfMissing();

const shopRepository =
  createJsonCollectionRepository({
    filePath: shopStatePath,
    indentation: 2
  });

function loadShops() {
  return shopRepository.loadAll();
}

function saveShops(shops) {
  return shopRepository.saveAll(shops);
}

function loadShop(shopId) {
  return shopRepository.loadById(shopId);
}

function loadShopsAtLocation(locationId) {
  return shopRepository
    .loadAll()
    .filter(function (shop) {
      return shop.locationId === locationId;
    });
}

module.exports = {
  loadShops,
  saveShops,
  loadShop,
  loadShopsAtLocation
};