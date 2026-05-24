const pool = require("./db");

//////////////////////////////////////////////////////
// GET STALLS WITH SEARCH AND FILTERS
//////////////////////////////////////////////////////
module.exports.selectStalls = (data, cb) =>
{
    let SQLSTATEMENT = `
        SELECT food_stalls.*
        FROM food_stalls
        LEFT JOIN menu_items
            ON food_stalls.stall_id = menu_items.stall_id
        WHERE 1 = 1
    `;

    const VALUES = [];

    if (data.search)
    {
        VALUES.push(`%${data.search}%`);

        SQLSTATEMENT += `
            AND (
                food_stalls.stall_name ILIKE $${VALUES.length}
                OR food_stalls.stall_description ILIKE $${VALUES.length}
                OR food_stalls.cuisine_type ILIKE $${VALUES.length}
                OR food_stalls.food_court ILIKE $${VALUES.length}
                OR menu_items.item_name ILIKE $${VALUES.length}
                OR menu_items.variation ILIKE $${VALUES.length}
                OR menu_items.item_description ILIKE $${VALUES.length}
                OR menu_items.category ILIKE $${VALUES.length}
            )
        `;
    }

    if (data.foodCourt)
    {
        VALUES.push(data.foodCourt);

        SQLSTATEMENT += `
            AND food_stalls.food_court = $${VALUES.length}
        `;
    }

    if (data.status)
    {
        VALUES.push(data.status);

        SQLSTATEMENT += `
            AND food_stalls.opening_status = $${VALUES.length}
        `;
    }

    if (data.dietary === "halal")
    {
        SQLSTATEMENT += `
            AND food_stalls.is_halal = TRUE
        `;
    }

    if (data.dietary === "vegetarian")
    {
        SQLSTATEMENT += `
            AND food_stalls.is_vegetarian = TRUE
        `;
    }

    if (data.dietary === "vegan")
    {
        SQLSTATEMENT += `
            AND food_stalls.is_vegan = TRUE
        `;
    }

    if (data.foodType)
    {
        VALUES.push(`%${data.foodType}%`);

        SQLSTATEMENT += `
            AND (
                food_stalls.cuisine_type ILIKE $${VALUES.length}
                OR menu_items.item_name ILIKE $${VALUES.length}
                OR menu_items.variation ILIKE $${VALUES.length}
                OR menu_items.category ILIKE $${VALUES.length}
            )
        `;
    }

    SQLSTATEMENT += `
        GROUP BY
            food_stalls.stall_id,
            food_stalls.stall_name,
            food_stalls.stall_description,
            food_stalls.cuisine_type,
            food_stalls.food_court,
            food_stalls.location_detail,
            food_stalls.opening_status,
            food_stalls.opening_time,
            food_stalls.closing_time,
            food_stalls.estimated_wait_time,
            food_stalls.rating,
            food_stalls.rating_count,
            food_stalls.image_url,
            food_stalls.is_halal,
            food_stalls.is_vegetarian,
            food_stalls.is_vegan,
            food_stalls.created_at
        ORDER BY
            CASE WHEN food_stalls.opening_status = 'open' THEN 1 ELSE 2 END,
            food_stalls.rating DESC,
            food_stalls.stall_name ASC;
    `;

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
        ORDER BY
            is_available DESC,
            is_popular DESC,
            category ASC,
            item_name ASC;
    `;

    const VALUES = [data.stall_id];

    pool.query(SQLSTATEMENT, VALUES, cb);
};