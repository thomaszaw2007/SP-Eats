const pool = require("./db");

//////////////////////////////////////////////////////
// GET ALL STALLS
//////////////////////////////////////////////////////
module.exports.selectAllStalls = (cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM food_stalls
        ORDER BY stall_name ASC;
    `;

    pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SEARCH STALLS
//////////////////////////////////////////////////////
module.exports.searchStalls = (data, cb) =>
{
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

    const VALUES = [`%${data.search}%`];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER STALLS BY FOOD COURT
//////////////////////////////////////////////////////
module.exports.filterStallsByFoodCourt = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM food_stalls
        WHERE food_court = $1
        ORDER BY stall_name ASC;
    `;

    const VALUES = [data.foodCourt];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER STALLS BY CUISINE
//////////////////////////////////////////////////////
module.exports.filterStallsByCuisine = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM food_stalls
        WHERE cuisine_type ILIKE $1
        ORDER BY stall_name ASC;
    `;

    const VALUES = [`%${data.category}%`];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER STALLS BY STATUS
//////////////////////////////////////////////////////
module.exports.filterStallsByStatus = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM food_stalls
        WHERE opening_status = $1
        ORDER BY stall_name ASC;
    `;

    const VALUES = [data.status];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// GET ONE STALL BY ID
//////////////////////////////////////////////////////
module.exports.selectStallById = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM food_stalls
        WHERE stall_id = $1;
    `;

    const VALUES = [data.stall_id];

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// GET MENU ITEMS FROM ONE STALL
//////////////////////////////////////////////////////
module.exports.selectMenuByStallId = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT *
        FROM menu_items
        WHERE stall_id = $1
        ORDER BY is_available DESC, item_name ASC;
    `;

    const VALUES = [data.stall_id];

    pool.query(SQLSTATEMENT, VALUES, cb);
};