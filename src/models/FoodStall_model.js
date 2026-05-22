const pool = require("./db");

// Get all stalls
module.exports.selectAllStalls = (callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM food_stalls
    ORDER BY stall_name ASC;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// Search stalls by stall name, cuisine, food court, or menu item name
module.exports.searchStalls = (searchText, callback) => {
  const SQLSTATEMENT = `
    SELECT DISTINCT food_stalls.*
    FROM food_stalls
    LEFT JOIN menu_items
    ON food_stalls.stall_id = menu_items.stall_id
    WHERE food_stalls.stall_name ILIKE $1
    OR food_stalls.cuisine_type ILIKE $1
    OR food_stalls.food_court ILIKE $1
    OR menu_items.item_name ILIKE $1
    OR menu_items.category ILIKE $1
    ORDER BY food_stalls.stall_name ASC;
  `;

  const VALUES = [`%${searchText}%`];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Filter stalls by food court
module.exports.filterStallsByFoodCourt = (foodCourt, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM food_stalls
    WHERE food_court = $1
    ORDER BY stall_name ASC;
  `;

  const VALUES = [foodCourt];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Filter stalls by cuisine/category
module.exports.filterStallsByCuisine = (cuisine, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM food_stalls
    WHERE cuisine_type ILIKE $1
    ORDER BY stall_name ASC;
  `;

  const VALUES = [`%${cuisine}%`];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Filter stalls by opening status
module.exports.filterStallsByStatus = (status, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM food_stalls
    WHERE opening_status = $1
    ORDER BY stall_name ASC;
  `;

  const VALUES = [status];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get one stall by stall_id
module.exports.selectStallById = (stallId, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM food_stalls
    WHERE stall_id = $1;
  `;

  const VALUES = [stallId];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get all menu items from one stall
module.exports.selectMenuByStallId = (stallId, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM menu_items
    WHERE stall_id = $1
    ORDER BY is_available DESC, item_name ASC;
  `;

  const VALUES = [stallId];

  pool.query(SQLSTATEMENT, VALUES, callback);
};