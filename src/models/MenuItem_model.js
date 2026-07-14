const pool = require('./db');

const MENU_ITEM_SELECT = `
    SELECT
        'item_' || LPAD(M."food_id"::TEXT, 3, '0') AS item_id,
        M."food_id" AS food_id,

        'stall_' || LPAD(M."stall_id"::TEXT, 3, '0') AS stall_id,
        M."stall_id" AS raw_stall_id,

        S."name" AS stall_name,
        S."description" AS stall_description,
        S."cuisine_type" AS cuisine_type,
        S."opening_status" AS opening_status,
        S."estimated_wait_time" AS estimated_wait_time,
        S."rating" AS stall_rating,

        FC."foodcourt_id" AS foodcourt_id,
        FC."name" AS food_court,
        FC."location" AS food_court_location,
        FC."description" AS food_court_description,

        M."name" AS item_name,
        M."variation" AS variation,
        M."description" AS item_description,
        M."price" AS price,
        M."category" AS category,
        M."image_url" AS image_url,

        M."is_available" AS is_available,
        M."is_popular" AS is_popular,

        M."calories" AS calories,
        M."nutrition_level" AS nutrition_level,
        M."carb_level" AS carb_level,
        M."protein_level" AS protein_level,
        M."fat_level" AS fat_level,
        M."sugar_level" AS sugar_level,
        M."spice_level" AS spice_level,
        M."allergen_info" AS allergen_info,
        M."portion_size" AS portion_size,

        M."item_rating",
        M."item_review_count",
        M."taste_rating",
        M."value_rating",
        M."portion_rating",
        M."order_count",

        M."created_at" AS created_at

        


    FROM "Menu" M
    JOIN "Stalls" S
        ON M."stall_id" = S."stall_id"
    JOIN "FoodCourt" FC
        ON M."foodcourt_id" = FC."foodcourt_id"
`;

//////////////////////////////////////////////////////
// GET ALL MENU ITEMS
//////////////////////////////////////////////////////
module.exports.selectAllMenuItems = (cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        ORDER BY
            M."is_available" DESC,
            M."is_popular" DESC,
            M."name" ASC;
    `;

  pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SEARCH MENU ITEMS
//////////////////////////////////////////////////////
module.exports.searchMenuItems = (data, cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        WHERE M."name" ILIKE $1
            OR S."name" ILIKE $1
            OR M."category" ILIKE $1
            OR M."variation" ILIKE $1
            OR M."description" ILIKE $1
        ORDER BY
            M."is_available" DESC,
            M."is_popular" DESC,
            M."name" ASC;
    `;

  const VALUES = [`%${data.search}%`];

  pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER MENU ITEMS BY CATEGORY
//////////////////////////////////////////////////////
module.exports.filterMenuItemsByCategory = (data, cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        WHERE M."category" ILIKE $1
        ORDER BY
            M."is_available" DESC,
            M."name" ASC;
    `;

  const VALUES = [`%${data.category}%`];

  pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER MENU ITEMS BY STALL
//////////////////////////////////////////////////////
module.exports.filterMenuItemsByStallId = (data, cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        WHERE M."stall_id" = CAST(NULLIF(REGEXP_REPLACE($1::TEXT, '[^0-9]', '', 'g'), '') AS INT)
        ORDER BY
            M."is_available" DESC,
            M."name" ASC;
    `;

  const VALUES = [data.stallId];

  pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// FILTER MENU ITEMS BY AVAILABILITY
//////////////////////////////////////////////////////
module.exports.filterMenuItemsByAvailability = (data, cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        WHERE M."is_available" = $1
        ORDER BY
            M."name" ASC;
    `;

  const VALUES = [data.available === 'true'];

  pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// GET POPULAR MENU ITEMS
//////////////////////////////////////////////////////
module.exports.selectPopularMenuItems = (cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        WHERE M."is_popular" = TRUE
        ORDER BY
            M."is_available" DESC,
            M."name" ASC;
    `;

  pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SORT MENU ITEMS BY PRICE LOW TO HIGH
//////////////////////////////////////////////////////
module.exports.sortMenuItemsByPriceLow = (cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        ORDER BY
            M."price" ASC;
    `;

  pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SORT MENU ITEMS BY PRICE HIGH TO LOW
//////////////////////////////////////////////////////
module.exports.sortMenuItemsByPriceHigh = (cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        ORDER BY
            M."price" DESC;
    `;

  pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// SORT MENU ITEMS BY NAME
//////////////////////////////////////////////////////
module.exports.sortMenuItemsByName = (cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        ORDER BY
            M."name" ASC;
    `;

  pool.query(SQLSTATEMENT, cb);
};

//////////////////////////////////////////////////////
// GET ONE MENU ITEM BY ID
//////////////////////////////////////////////////////
module.exports.selectMenuItemById = (data, cb) => {
  const SQLSTATEMENT = `
        ${MENU_ITEM_SELECT}
        WHERE M."food_id" = CAST(NULLIF(REGEXP_REPLACE($1::TEXT, '[^0-9]', '', 'g'), '') AS INT)
        LIMIT 1;
    `;

  const VALUES = [data.item_id];

  pool.query(SQLSTATEMENT, VALUES, cb);
};