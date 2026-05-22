const pool = require("./db");

// Get all menu items
module.exports.selectAllMenuItems = (callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    ORDER BY is_available DESC, is_popular DESC, item_name ASC;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// Search menu items by item name, stall name, or category
module.exports.searchMenuItems = (searchText, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    WHERE item_name ILIKE $1
    OR stall_name ILIKE $1
    OR category ILIKE $1
    ORDER BY is_available DESC, is_popular DESC, item_name ASC;
  `;

  const VALUES = [`%${searchText}%`];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Filter menu items by category
module.exports.filterMenuItemsByCategory = (category, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    WHERE category ILIKE $1
    ORDER BY is_available DESC, item_name ASC;
  `;

  const VALUES = [`%${category}%`];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Filter menu items by stall
module.exports.filterMenuItemsByStallId = (stallId, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    WHERE stall_id = $1
    ORDER BY is_available DESC, item_name ASC;
  `;

  const VALUES = [stallId];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Filter menu items by availability
module.exports.filterMenuItemsByAvailability = (isAvailable, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    WHERE is_available = $1
    ORDER BY item_name ASC;
  `;

  const VALUES = [isAvailable];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get popular menu items
module.exports.selectPopularMenuItems = (callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    WHERE is_popular = TRUE
    ORDER BY is_available DESC, item_name ASC;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// Sort menu items by price low to high
module.exports.sortMenuItemsByPriceLow = (callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    ORDER BY price ASC;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// Sort menu items by price high to low
module.exports.sortMenuItemsByPriceHigh = (callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    ORDER BY price DESC;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// Sort menu items by name A to Z
module.exports.sortMenuItemsByName = (callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    ORDER BY item_name ASC;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// Get one menu item by item_id
module.exports.selectMenuItemById = (itemId, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    WHERE item_id = $1;
  `;

  const VALUES = [itemId];

  pool.query(SQLSTATEMENT, VALUES, callback);
};