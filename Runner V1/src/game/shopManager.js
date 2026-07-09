const fs = require("fs");
const path = require("path");

const shopsPath = path.join(__dirname, "../../data/shops/shops.json");

function loadShops() {
    const shopData = fs.readFileSync(shopsPath, "utf8");
    return JSON.parse(shopData);
}

function saveShops(shops) {
    const shopData = JSON.stringify(shops, null, 2);
    fs.writeFileSync(shopsPath, shopData);
}

function loadShop(shopId) {
    const shops = loadShops();

    return shops.find(function(shop) {
        return shop.id === shopId;
    });
}

function loadShopsAtLocation(locationId) {
    const shops = loadShops();

    return shops.filter(function(shop) {
        return shop.locationId === locationId;
    });
}

module.exports = {
    loadShops,
    saveShops,
    loadShop,
    loadShopsAtLocation
};