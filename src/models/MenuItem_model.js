const pool = require("./db");

//////////////////////////////////////////////////////
// GET ALL MENU ITEMS
//////////////////////////////////////////////////////
module.exports.selectAllMenuItems = (cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        ORDER BY is_available DESC, is_popular DESC, item_name ASC;
    `;

    pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SEARCH MENU ITEMS
//////////////////////////////////////////////////////
module.exports.searchMenuItems = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        WHERE item_name ILIKE $1
            OR stall_name ILIKE $1
            OR category ILIKE $1
        ORDER BY is_available DESC, is_popular DESC, item_name ASC;
    `;

    const VALUES = [`%${data.search}%`];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER MENU ITEMS BY CATEGORY
//////////////////////////////////////////////////////
module.exports.filterMenuItemsByCategory = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        WHERE category ILIKE $1
        ORDER BY is_available DESC, item_name ASC;
    `;

    const VALUES = [`%${data.category}%`];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER MENU ITEMS BY STALL
//////////////////////////////////////////////////////
module.exports.filterMenuItemsByStallId = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        WHERE stall_id = $1
        ORDER BY is_available DESC, item_name ASC;
    `;

    const VALUES = [data.stallId];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER MENU ITEMS BY AVAILABILITY
//////////////////////////////////////////////////////
module.exports.filterMenuItemsByAvailability = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        WHERE is_available = $1
        ORDER BY item_name ASC;
    `;

    const VALUES = [data.available === "true"];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// GET POPULAR MENU ITEMS
//////////////////////////////////////////////////////
module.exports.selectPopularMenuItems = (cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        WHERE is_popular = TRUE
        ORDER BY is_available DESC, item_name ASC;
    `;

    pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SORT MENU ITEMS BY PRICE LOW TO HIGH
//////////////////////////////////////////////////////
module.exports.sortMenuItemsByPriceLow = (cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        ORDER BY price ASC;
    `;

    pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SORT MENU ITEMS BY PRICE HIGH TO LOW
//////////////////////////////////////////////////////
module.exports.sortMenuItemsByPriceHigh = (cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        ORDER BY price DESC;
    `;

    pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SORT MENU ITEMS BY NAME
//////////////////////////////////////////////////////
module.exports.sortMenuItemsByName = (cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        ORDER BY item_name ASC;
    `;

    pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// GET ONE MENU ITEM BY ID
//////////////////////////////////////////////////////
module.exports.selectMenuItemById = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        WHERE item_id = $1;
    `;

    const VALUES = [data.item_id];

    pool.query(SQLSTATEMENT, VALUES, cb);
};