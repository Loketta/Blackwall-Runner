const path = require("path");
const {
  createJsonCollectionRepository
} = require("../repositories/jsonCollectionRepository");

const itemRepository = createJsonCollectionRepository({
  filePath: path.join(
    __dirname,
    "../../../data/Items/items.json"
  ),
  indentation: 2
});

function loadItems() {
  return itemRepository.loadAll();
}

function loadItem(itemId) {
  return itemRepository.loadById(itemId);
}

module.exports = {
  loadItems,
  loadItem
};
