const { processWorldEvents } = require("../events/eventSystem");
const { advanceCalendarDay } = require("./calendarSystem");

function advanceWorldTime(world, minutes) {
    const [hours, mins] = world.currentTime.split(":").map(Number);

    let totalMinutes = hours * 60 + mins;
    totalMinutes += minutes;

    while (totalMinutes >= 1440) {
        totalMinutes -= 1440;
        world.day += 1;
        advanceCalendarDay(world);
    }

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    world.currentTime =
        `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;

    return processWorldEvents(world);
}

module.exports = {
    advanceWorldTime
};