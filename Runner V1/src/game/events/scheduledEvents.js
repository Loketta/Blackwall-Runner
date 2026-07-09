const { loadShops, saveShops } = require("../shopManager");

function processScheduledEvents(world) {
    const events = [];

    if (!world.scheduledEvents) {
        world.scheduledEvents = [];
    }

    const remainingEvents = [];

    for (const scheduledEvent of world.scheduledEvents) {
        const eventIsDue =
            scheduledEvent.day === world.day &&
            scheduledEvent.time === world.currentTime;

        if (eventIsDue) {
            if (scheduledEvent.type === "shop_opened") {
                const shops = loadShops();
                const shop = shops.find(function(shop) {
                    return shop.id === scheduledEvent.data.shopId;
                });

                if (shop) {
                    shop.isOpen = true;
                    saveShops(shops);
                }
            }

            events.push({
                type: scheduledEvent.type,
                locationId: scheduledEvent.locationId,
                data: scheduledEvent.data || {}
            });
        } else {
            remainingEvents.push(scheduledEvent);
        }
    }

    world.scheduledEvents = remainingEvents;

    return events;
}

module.exports = {
    processScheduledEvents
};