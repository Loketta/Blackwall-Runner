const { loadShops, saveShops } = require("../shopManager");

function parseTimeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function getAbsoluteMinutes(day, time) {
    return day * 1440 + parseTimeToMinutes(time);
}

function applyScheduledEventEffect(scheduledEvent) {
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
}

function processScheduledEvents(world) {
    const events = [];

    if (!world.scheduledEvents) {
        world.scheduledEvents = [];
    }

    const currentAbsoluteMinutes = getAbsoluteMinutes(world.day, world.currentTime);
    const remainingEvents = [];

    for (const scheduledEvent of world.scheduledEvents) {
        const eventAbsoluteMinutes = getAbsoluteMinutes(
            scheduledEvent.day,
            scheduledEvent.time
        );

        const eventIsDue = eventAbsoluteMinutes <= currentAbsoluteMinutes;

        if (eventIsDue) {
            applyScheduledEventEffect(scheduledEvent);

            events.push({
                type: scheduledEvent.type,
                locationId: scheduledEvent.locationId || null,
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
