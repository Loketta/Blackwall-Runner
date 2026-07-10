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

    const currentWeather = world.weather;
    const currentIndex = weatherStates.indexOf(currentWeather);

    if (currentIndex === -1) {
        return events;
    }

    let nextIndex = currentIndex;

    const roll = Math.random();

    if (roll < 0.33) {
        nextIndex = Math.max(0, currentIndex - 1);
    } else if (roll > 0.66) {
        nextIndex = Math.min(weatherStates.length - 1, currentIndex + 1);
    }

    if (nextIndex !== currentIndex) {
        const newWeather = weatherStates[nextIndex];
        world.weather = newWeather;

        events.push({
            type: "weather_changed",
            locationId: null,
            data: {
                previousWeather: currentWeather,
                newWeather: newWeather
            }
        });
    }

    return events;
}

module.exports = {
    processWeatherEvents
};
