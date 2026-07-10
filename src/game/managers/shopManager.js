const path = require("path");
const {
  createJsonCollectionRepository
} = require("../repositories/jsonCollectionRepository");

const shopRepository = createJsonCollectionRepository({
  filePath: path.join(
    __dirname,
    "../../../data/Shops/shops.json"
  ),
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
