const fs = require("fs");
const path = require("path");

function getLocationPath(locationId) {
    return path.join(
        __dirname,
        "../../data/locations",
        `${locationId}.json`
    );
}

function loadLocation(locationId) {
    const filePath = getLocationPath(locationId);
    const fileData = fs.readFileSync(filePath, "utf8");

    return JSON.parse(fileData);
}

function saveLocation(location) {
    const filePath = getLocationPath(location.id);
    const fileData = JSON.stringify(location, null, 2);

    fs.writeFileSync(filePath, fileData);
}

module.exports = {
    loadLocation,
    saveLocation
};