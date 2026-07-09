const weatherStates = [
    "clear",
    "cloudy",
    "light rain",
    "heavy rain",
    "storm"
];

function processWeatherEvents(world) {
    const events = [];

    if (!world.weatherTimer) {
        world.weatherTimer = 0;
    }

    world.weatherTimer++;

    if (world.weatherTimer < 6) {
        return events;
    }

    world.weatherTimer = 0;

    const currentIndex = weatherStates.indexOf(world.weather);

    let nextIndex = currentIndex;

    const roll = Math.random();

    if (roll < 0.33) {
        nextIndex = Math.max(0, currentIndex - 1);
    } else if (roll > 0.66) {
        nextIndex = Math.min(weatherStates.length - 1, currentIndex + 1);
    }

    if (nextIndex !== currentIndex) {
        world.weather = weatherStates[nextIndex];

        events.push({
            type: "weather_changed",
            message: `The weather changes. It is now ${world.weather}.`
        });
    }

    return events;
}

module.exports = {
    processWeatherEvents
};