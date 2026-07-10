function hasItem(container, itemId) {
  return container.items.includes(itemId);
}

function addItem(container, itemId) {
  container.items.push(itemId);
}

function removeItem(container, itemId) {
  const index = container.items.indexOf(itemId);

  if (index === -1) {
    return false;
  }

  container.items.splice(index, 1);
  return true;
}

module.exports = {
  hasItem,
  addItem,
  removeItem
};