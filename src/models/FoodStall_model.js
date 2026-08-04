const pool = require('./db');

function normalizeStallIdParameter(parameterIndex) {
  return `CAST(NULLIF(REGEXP_REPLACE($${parameterIndex}::TEXT, '[^0-9]', '', 'g'), '') AS INT)`;
}

const STALL_REVIEW_STATS_SQL = `
  SELECT
    m."stall_id",
    ROUND(AVG(r."rating")::numeric, 1) AS rating,
    COUNT(r."review_id")::INT AS rating_count
  FROM "Menu" m
  INNER JOIN "Reviews" r
    ON m."food_id" = r."food_id"
  GROUP BY m."stall_id"
`;

const MENU_REVIEW_STATS_SQL = `
  SELECT
    r."food_id",
    ROUND(AVG(r."rating")::numeric, 1) AS item_rating,
    COUNT(r."review_id")::INT AS item_review_count,
    ROUND(AVG(r."taste_rating")::numeric, 1) AS taste_rating,
    ROUND(AVG(r."value_rating")::numeric, 1) AS value_rating,
    ROUND(AVG(r."portion_rating")::numeric, 1) AS portion_rating,
    ROUND(AVG(r."wait_time_rating")::numeric, 1) AS wait_time_rating
  FROM "Reviews" r
  GROUP BY r."food_id"
`;

//////////////////////////////////////////////////////
// GET STALLS WITH SEARCH AND FILTERS
//////////////////////////////////////////////////////
module.exports.selectStalls = (data, cb) => {
  let SQLSTATEMENT = `
        WITH stall_review_stats AS (
          ${STALL_REVIEW_STATS_SQL}
        )
        SELECT
            'stall_' || LPAD(S."stall_id"::TEXT, 3, '0') AS stall_id,
            S."stall_id" AS raw_stall_id,
            S."name" AS stall_name,
            S."description" AS stall_description,
            S."cuisine_type" AS cuisine_type,
            FC."name" AS food_court,
            COALESCE(S."location_detail", FC."location") AS location_detail,
            S."opening_status" AS opening_status,
            S."opening_time" AS opening_time,
            S."closing_time" AS closing_time,
            S."estimated_wait_time" AS estimated_wait_time,
            COALESCE(SRS.rating, 0) AS rating,
            COALESCE(SRS.rating_count, 0) AS rating_count,
            S."image_url" AS image_url,
            S."halal" AS is_halal,
            S."vegetarian" AS is_vegetarian,
            S."vegan" AS is_vegan,
            S."created_at" AS created_at
        FROM "Stalls" S
        JOIN "FoodCourt" FC
            ON S."foodcourt_id" = FC."foodcourt_id"
        LEFT JOIN stall_review_stats SRS
            ON S."stall_id" = SRS."stall_id"
        LEFT JOIN "Menu" M
            ON S."stall_id" = M."stall_id"
        WHERE 1 = 1
    `;

  const VALUES = [];

  if (data.search) {
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

  if (data.foodCourt) {
    VALUES.push(data.foodCourt);

    SQLSTATEMENT += `
            AND FC."name" = $${VALUES.length}
        `;
  }

  if (data.status) {
    VALUES.push(data.status);

    SQLSTATEMENT += `
            AND S."opening_status" = $${VALUES.length}
        `;
  }

  if (data.dietary === 'halal') {
    SQLSTATEMENT += `
            AND S."halal" = TRUE
        `;
  }

  if (data.dietary === 'vegetarian') {
    SQLSTATEMENT += `
            AND S."vegetarian" = TRUE
        `;
  }

  if (data.dietary === 'vegan') {
    SQLSTATEMENT += `
            AND S."vegan" = TRUE
        `;
  }

  if (data.foodType) {
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
            SRS.rating,
            SRS.rating_count,
            S."image_url",
            S."halal",
            S."vegetarian",
            S."vegan",
            S."created_at"
        ORDER BY
            CASE WHEN S."opening_status" = 'open' THEN 1 ELSE 2 END,
            COALESCE(SRS.rating, 0) DESC,
            S."name" ASC;
    `;

  pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// GET ONE STALL BY ID
//////////////////////////////////////////////////////
module.exports.selectStallById = (data, cb) => {
  const SQLSTATEMENT = `
        WITH stall_review_stats AS (
          ${STALL_REVIEW_STATS_SQL}
        )
        SELECT
            'stall_' || LPAD(S."stall_id"::TEXT, 3, '0') AS stall_id,
            S."stall_id" AS raw_stall_id,
            S."name" AS stall_name,
            S."description" AS stall_description,
            S."cuisine_type" AS cuisine_type,
            FC."name" AS food_court,
            COALESCE(S."location_detail", FC."location") AS location_detail,
            S."opening_status" AS opening_status,
            S."opening_time" AS opening_time,
            S."closing_time" AS closing_time,
            S."estimated_wait_time" AS estimated_wait_time,
            COALESCE(SRS.rating, 0) AS rating,
            COALESCE(SRS.rating_count, 0) AS rating_count,
            S."image_url" AS image_url,
            S."halal" AS is_halal,
            S."vegetarian" AS is_vegetarian,
            S."vegan" AS is_vegan,
            S."created_at" AS created_at
        FROM "Stalls" S
        JOIN "FoodCourt" FC
            ON S."foodcourt_id" = FC."foodcourt_id"
        LEFT JOIN stall_review_stats SRS
            ON S."stall_id" = SRS."stall_id"
        WHERE S."stall_id" = ${normalizeStallIdParameter(1)};
    `;

  const VALUES = [data.stall_id];

  pool.query(SQLSTATEMENT, VALUES, cb);
};

//////////////////////////////////////////////////////
// GET MENU ITEMS FROM ONE STALL
//////////////////////////////////////////////////////
module.exports.selectMenuByStallId = (data, cb) => {
  const SQLSTATEMENT = `
        WITH menu_review_stats AS (
          ${MENU_REVIEW_STATS_SQL}
        )
        SELECT
            'item_' || LPAD(M."food_id"::TEXT, 3, '0') AS item_id,
            M."food_id" AS food_id,
            'stall_' || LPAD(M."stall_id"::TEXT, 3, '0') AS stall_id,
            M."stall_id" AS raw_stall_id,
            S."name" AS stall_name,
            M."name" AS item_name,
            M."variation" AS variation,
            M."description" AS item_description,
            M."price" AS price,
            M."category" AS category,
            M."image_url" AS image_url,
            M."is_available" AS is_available,
            M."is_popular" AS is_popular,

            COALESCE(MRS.item_rating, 0) AS item_rating,
            COALESCE(MRS.item_review_count, 0) AS item_review_count,
            COALESCE(MRS.taste_rating, 0) AS taste_rating,
            COALESCE(MRS.value_rating, 0) AS value_rating,
            COALESCE(MRS.portion_rating, 0) AS portion_rating,
            COALESCE(MRS.wait_time_rating, 0) AS wait_time_rating,

            M."calories" AS calories,
            M."nutrition_level" AS nutrition_level,
            M."carb_level" AS carb_level,
            M."protein_level" AS protein_level,
            M."fat_level" AS fat_level,
            M."sugar_level" AS sugar_level,
            M."spice_level" AS spice_level,
            M."allergen_info" AS allergen_info,
            M."portion_size" AS portion_size,
            M."order_count" AS order_count,
            M."created_at" AS created_at
        FROM "Menu" M
        JOIN "Stalls" S
            ON M."stall_id" = S."stall_id"
        LEFT JOIN menu_review_stats MRS
            ON M."food_id" = MRS."food_id"
        WHERE M."stall_id" = ${normalizeStallIdParameter(1)}
        ORDER BY
            M."is_available" DESC,
            M."is_popular" DESC,
            M."category" ASC,
            M."name" ASC;
    `;

  const VALUES = [data.stall_id];

  pool.query(SQLSTATEMENT, VALUES, cb);
};
