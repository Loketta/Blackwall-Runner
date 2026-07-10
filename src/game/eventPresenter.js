const { loadShop } = require("./managers/shopManager");

function presentShopOpened(event) {
    const shop = loadShop(event.data.shopId);

    if (shop) {
        return `${shop.name} opens for trade.`;
    }

    return "A nearby shop opens for trade.";
}

function presentWeatherChanged(event) {
    return `The weather changes. It is now ${event.data.newWeather}.`;
}

function presentRentDue(event) {
    return `Monthly rent is due: ${event.data.monthlyCost} credits.`;
}

function presentEvent(event) {
    if (event.type === "shop_opened") {
        return presentShopOpened(event);
    }

    if (event.type === "weather_changed") {
        return presentWeatherChanged(event);
    }

    if (event.type === "rent_due") {
        return presentRentDue(event);
    }

    return "Something happens nearby.";
}

module.exports = {
    presentEvent
};
