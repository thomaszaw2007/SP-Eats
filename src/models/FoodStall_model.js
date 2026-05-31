const pool = require("./db");

//////////////////////////////////////////////////////
// GET STALLS WITH SEARCH AND FILTERS
//////////////////////////////////////////////////////
module.exports.selectStalls = (data, cb) =>
{
    let SQLSTATEMENT = `
        SELECT
            'stall_' || LPAD(S."stall_id"::TEXT, 3, '0') AS stall_id,
            S."name" AS stall_name,
            S."description" AS stall_description,
            S."cuisine_type" AS cuisine_type,
            FC."name" AS food_court,
            COALESCE(S."location_detail", FC."location") AS location_detail,
            S."opening_status" AS opening_status,
            S."opening_time" AS opening_time,
            S."closing_time" AS closing_time,
            S."estimated_wait_time" AS estimated_wait_time,
            S."rating" AS rating,
            S."rating_count" AS rating_count,
            S."image_url" AS image_url,
            S."halal" AS is_halal,
            S."vegetarian" AS is_vegetarian,
            S."vegan" AS is_vegan,
            S."created_at" AS created_at
        FROM "Stalls" S
        JOIN "FoodCourt" FC
            ON S."foodcourt_id" = FC."foodcourt_id"
        LEFT JOIN "Menu" M
            ON S."stall_id" = M."stall_id"
        WHERE 1 = 1
    `;

    const VALUES = [];

    if (data.search)
    {
        VALUES.push(`%${data.search}%`);

        SQLSTATEMENT += `
            AND (
                S."name" ILIKE $${VALUES.length}
                OR S."description" ILIKE $${VALUES.length}
                OR S."cuisine_type" ILIKE $${VALUES.length}
                OR FC."name" ILIKE $${VALUES.length}
                OR M."name" ILIKE $${VALUES.length}
                OR M."variation" ILIKE $${VALUES.length}
                OR M."description" ILIKE $${VALUES.length}
                OR M."category" ILIKE $${VALUES.length}
            )
        `;
    }

    if (data.foodCourt)
    {
        VALUES.push(data.foodCourt);

        SQLSTATEMENT += `
            AND FC."name" = $${VALUES.length}
        `;
    }

    if (data.status)
    {
        VALUES.push(data.status);

        SQLSTATEMENT += `
            AND S."opening_status" = $${VALUES.length}
        `;
    }

    if (data.dietary === "halal")
    {
        SQLSTATEMENT += `
            AND S."halal" = TRUE
        `;
    }

    if (data.dietary === "vegetarian")
    {
        SQLSTATEMENT += `
            AND S."vegetarian" = TRUE
        `;
    }

    if (data.dietary === "vegan")
    {
        SQLSTATEMENT += `
            AND S."vegan" = TRUE
        `;
    }

    if (data.foodType)
    {
        VALUES.push(`%${data.foodType}%`);

        SQLSTATEMENT += `
            AND (
                S."cuisine_type" ILIKE $${VALUES.length}
                OR M."name" ILIKE $${VALUES.length}
                OR M."variation" ILIKE $${VALUES.length}
                OR M."category" ILIKE $${VALUES.length}
            )
        `;
    }

    SQLSTATEMENT += `
        GROUP BY
            S."stall_id",
            S."name",
            S."description",
            S."cuisine_type",
            FC."name",
            FC."location",
            S."location_detail",
            S."opening_status",
            S."opening_time",
            S."closing_time",
            S."estimated_wait_time",
            S."rating",
            S."rating_count",
            S."image_url",
            S."halal",
            S."vegetarian",
            S."vegan",
            S."created_at"
        ORDER BY
            CASE WHEN S."opening_status" = 'open' THEN 1 ELSE 2 END,
            S."rating" DESC,
            S."name" ASC;
    `;

    pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// GET ONE STALL BY ID
//////////////////////////////////////////////////////
module.exports.selectStallById = (data, cb) =>
{
    const SQLSTATEMENT = `
        SELECT
            'stall_' || LPAD(S."stall_id"::TEXT, 3, '0') AS stall_id,
            S."name" AS stall_name,
            S."description" AS stall_description,
            S."cuisine_type" AS cuisine_type,
            FC."name" AS food_court,
            COALESCE(S."location_detail", FC."location") AS location_detail,
            S."opening_status" AS opening_status,
            S."opening_time" AS opening_time,
            S."closing_time" AS closing_time,
            S."estimated_wait_time" AS estimated_wait_time,
            S."rating" AS rating,
            S."rating_count" AS rating_count,
            S."image_url" AS image_url,
            S."halal" AS is_halal,
            S."vegetarian" AS is_vegetarian,
            S."vegan" AS is_vegan,
            S."created_at" AS created_at
        FROM "Stalls" S
        JOIN "FoodCourt" FC
            ON S."foodcourt_id" = FC."foodcourt_id"
        WHERE S."stall_id" = CAST(NULLIF(REGEXP_REPLACE($1::TEXT, '[^0-9]', '', 'g'), '') AS INT);
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
        WHERE M."stall_id" = CAST(NULLIF(REGEXP_REPLACE($1::TEXT, '[^0-9]', '', 'g'), '') AS INT)
        ORDER BY
            M."is_available" DESC,
            M."is_popular" DESC,
            M."category" ASC,
            M."name" ASC;
    `;

    const VALUES = [data.stall_id];

    pool.query(SQLSTATEMENT, VALUES, cb);
};
