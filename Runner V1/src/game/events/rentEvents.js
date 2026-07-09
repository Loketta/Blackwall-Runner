function processRentEvents(world) {
    const events = [];

    if (!world.rent || !world.calendar) {
        return events;
    }

    const rentDueToday =
        world.calendar.dayOfMonth === world.rent.dueDayOfMonth;

    const alreadyChargedThisMonth =
        world.rent.lastChargedYear === world.calendar.year &&
        world.rent.lastChargedMonth === world.calendar.month;

    if (rentDueToday && !alreadyChargedThisMonth) {
        world.rent.lastChargedYear = world.calendar.year;
        world.rent.lastChargedMonth = world.calendar.month;

        events.push({
            type: "rent_due",
            message: `Monthly rent is due: ${world.rent.monthlyCost} credits.`
        });
    }

    return events;
}

module.exports = {
    processRentEvents
};