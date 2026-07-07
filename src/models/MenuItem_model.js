const pool = require('./db');

const MENU_ITEM_SELECT = `
    SELECT
        'item_' || LPAD(M."food_id"::TEXT, 3, '0') AS item_id,
        'stall_' || LPAD(M."stall_id"::TEXT, 3, '0') AS stall_id,
        S."name" AS stall_name,
        M."name" AS item_name,
        M."variation" AS variation,
        M."description" AS item_description,
        M."price" AS price,
        M."category" AS category,
        M."image_url" AS image_url,
        M."is_available" AS is_available,
        M."is_popular" AS is_popular,
        M."created_at" AS created_at
    FROM "Menu" M
    JOIN "Stalls" S
        ON M."stall_id" = S."stall_id"
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
        WHERE M."food_id" = CAST(NULLIF(REGEXP_REPLACE($1::TEXT, '[^0-9]', '', 'g'), '') AS INT);
    `;

  const VALUES = [data.item_id];

  pool.query(SQLSTATEMENT, VALUES, cb);
};
