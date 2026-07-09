function presentEvent(event) {
    if (event.type === "shop_opened") {
        if (event.data.shopId === "kuroda_mart") {
            return "A battered vending hatch nearby buzzes awake as Kuroda Mart opens for trade.";
        }

        return "A nearby shop opens for trade.";
    }

    if (event.type === "weather_changed") {
        return event.message;
    }

    if (event.type === "rent_due") {
        return event.message;
    }

    return event.message || "Something happens nearby.";
}

module.exports = {
    presentEvent
};