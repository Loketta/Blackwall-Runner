function hasItem(location, itemId) {
    return location.items.includes(itemId);
}

function addItem(location, itemId) {
    location.items.push(itemId);
}

function removeItem(location, itemId) {
    const index = location.items.indexOf(itemId);

    if (index === -1) {
        return false;
    }

    location.items.splice(index, 1);

    return true;
}

module.exports = {
    hasItem,
    addItem,
    removeItem
};