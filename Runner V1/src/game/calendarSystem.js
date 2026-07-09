function advanceCalendarDay(world) {
    if (!world.calendar) {
        world.calendar = {
            year: 2045,
            month: 1,
            dayOfMonth: world.day
        };
    }

    world.calendar.dayOfMonth += 1;

    if (world.calendar.dayOfMonth > 30) {
        world.calendar.dayOfMonth = 1;
        world.calendar.month += 1;
    }

    if (world.calendar.month > 12) {
        world.calendar.month = 1;
        world.calendar.year += 1;
    }
}

module.exports = {
    advanceCalendarDay
};