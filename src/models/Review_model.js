const pool = require('./db');

module.exports.selectAllReviews = (callback) => {
  const sql = `
    SELECT
      r."review_id",
      r."food_id",
      r."reviewer_name",
      r."rating",
      r."review_text",
      r."review_tag",
      r."best_time_to_buy",
      r."created_at",
      m."name" AS item_name,
      m."price",
      m."category",
      m."image_url",
      s."stall_id",
      s."name" AS stall_name,
      s."cuisine_type",
      fc."foodcourt_id",
      fc."name" AS foodcourt_name,
      fc."location" AS foodcourt_location
    FROM "Reviews" r
    INNER JOIN "Menu" m
      ON r."food_id" = m."food_id"
    INNER JOIN "Stalls" s
      ON m."stall_id" = s."stall_id"
    INNER JOIN "FoodCourt" fc
      ON s."foodcourt_id" = fc."foodcourt_id"
    ORDER BY
      r."created_at" DESC,
      r."rating" DESC;
  `;

  pool.query(sql, (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows);
  });
};

module.exports.selectReviewsByFoodId = (foodId, callback) => {
  const sql = `
    SELECT
      r."review_id",
      r."food_id",
      r."reviewer_name",
      r."rating",
      r."review_text",
      r."review_tag",
      r."best_time_to_buy",
      r."created_at",
      m."name" AS item_name,
      m."price",
      m."category",
      m."image_url",
      s."stall_id",
      s."name" AS stall_name,
      s."cuisine_type",
      fc."foodcourt_id",
      fc."name" AS foodcourt_name,
      fc."location" AS foodcourt_location
    FROM "Reviews" r
    INNER JOIN "Menu" m
      ON r."food_id" = m."food_id"
    INNER JOIN "Stalls" s
      ON m."stall_id" = s."stall_id"
    INNER JOIN "FoodCourt" fc
      ON s."foodcourt_id" = fc."foodcourt_id"
    WHERE r."food_id" = $1
    ORDER BY
      r."created_at" DESC,
      r."rating" DESC;
  `;

  pool.query(sql, [foodId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows);
  });
};