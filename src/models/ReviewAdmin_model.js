const pool = require('./db');

function addFilterCondition(conditions, values, value, sqlBuilder) {
  if (!value || value === 'all') {
    return;
  }

  values.push(value);
  conditions.push(sqlBuilder(values.length));
}

function getAdminReviewBaseSelect() {
  return `
    SELECT
      r."review_id",
      r."food_id",
      r."reviewer_name",
      r."rating",
      r."taste_rating",
      r."value_rating",
      r."portion_rating",
      r."wait_time_rating",
      r."review_text",
      r."review_tag",
      COALESCE(r."review_tags", ARRAY[r."review_tag"]) AS review_tags,
      r."best_time_to_buy",
      r."review_photo_url",
      r."helpful_count",
      r."created_at",

      m."name" AS item_name,
      m."price",
      m."category",
      m."image_url",
      m."item_rating",
      m."item_review_count",

      s."stall_id",
      s."name" AS stall_name,
      s."rating" AS stall_rating,
      s."rating_count" AS stall_review_count,

      fc."foodcourt_id",
      fc."name" AS foodcourt_name
    FROM "Reviews" r
    INNER JOIN "Menu" m
      ON r."food_id" = m."food_id"
    INNER JOIN "Stalls" s
      ON m."stall_id" = s."stall_id"
    INNER JOIN "FoodCourt" fc
      ON s."foodcourt_id" = fc."foodcourt_id"
  `;
}

function getRatingFilterSql(filterValue) {
  if (filterValue === '5') {
    return 'r."rating" >= 4.5';
  }

  if (filterValue === '4') {
    return 'r."rating" >= 4 AND r."rating" < 4.5';
  }

  if (filterValue === '3') {
    return 'r."rating" >= 3 AND r."rating" < 4';
  }

  if (filterValue === 'below3') {
    return 'r."rating" < 3';
  }

  return '';
}

module.exports.selectAdminReviews = (filters, callback) => {
  const conditions = [];
  const values = [];

  addFilterCondition(conditions, values, filters.search, (index) => {
    return `
      (
        LOWER(r."reviewer_name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(r."review_text") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(r."review_tag") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(s."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(fc."name") LIKE LOWER('%' || $${index} || '%')
      )
    `;
  });

  const ratingFilterSql = getRatingFilterSql(filters.ratingFilter);

  if (ratingFilterSql) {
    conditions.push(ratingFilterSql);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    ${getAdminReviewBaseSelect()}
    ${whereSql}
    ORDER BY r."created_at" DESC, r."review_id" DESC;
  `;

  pool.query(sql, values, (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows);
  });
};

module.exports.selectAdminReviewById = (reviewId, callback) => {
  const sql = `
    ${getAdminReviewBaseSelect()}
    WHERE r."review_id" = $1;
  `;

  pool.query(sql, [reviewId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};

module.exports.selectAdminSummary = (callback) => {
  const summarySql = `
    SELECT
      COUNT("review_id")::INT AS total_reviews,
      ROUND(AVG("rating")::numeric, 1) AS average_rating,
      COALESCE(SUM("helpful_count"), 0)::INT AS total_helpful_count,
      COUNT(
        CASE
          WHEN "review_photo_url" IS NOT NULL AND "review_photo_url" <> '' THEN 1
        END
      )::INT AS photo_review_count
    FROM "Reviews";
  `;

  const ratingBreakdownSql = `
    WITH rating_buckets AS (
      SELECT '5 star' AS label, 1 AS sort_order
      UNION ALL SELECT '4 star', 2
      UNION ALL SELECT '3 star', 3
      UNION ALL SELECT 'Below 3', 4
    )
    SELECT
      rb.label,
      COUNT(r."review_id")::INT AS review_count
    FROM rating_buckets rb
    LEFT JOIN "Reviews" r
      ON (
        (rb.label = '5 star' AND r."rating" >= 4.5)
        OR (rb.label = '4 star' AND r."rating" >= 4 AND r."rating" < 4.5)
        OR (rb.label = '3 star' AND r."rating" >= 3 AND r."rating" < 4)
        OR (rb.label = 'Below 3' AND r."rating" < 3)
      )
    GROUP BY rb.label, rb.sort_order
    ORDER BY rb.sort_order ASC;
  `;

  const reviewsByStallSql = `
    SELECT
      s."stall_id",
      s."name" AS stall_name,
      COUNT(r."review_id")::INT AS review_count,
      ROUND(AVG(r."rating")::numeric, 1) AS average_rating
    FROM "Stalls" s
    INNER JOIN "Menu" m
      ON s."stall_id" = m."stall_id"
    INNER JOIN "Reviews" r
      ON m."food_id" = r."food_id"
    GROUP BY
      s."stall_id",
      s."name"
    ORDER BY
      review_count DESC,
      average_rating DESC,
      s."name" ASC
    LIMIT 8;
  `;

  pool.query(summarySql, (summaryError, summaryResult) => {
    if (summaryError) {
      callback(summaryError, null);
      return;
    }

    pool.query(ratingBreakdownSql, (breakdownError, breakdownResult) => {
      if (breakdownError) {
        callback(breakdownError, null);
        return;
      }

      pool.query(reviewsByStallSql, (stallError, stallResult) => {
        if (stallError) {
          callback(stallError, null);
          return;
        }

        callback(null, {
          total_reviews: summaryResult.rows[0].total_reviews,
          average_rating: Number(summaryResult.rows[0].average_rating || 0),
          total_helpful_count: summaryResult.rows[0].total_helpful_count,
          photo_review_count: summaryResult.rows[0].photo_review_count,
          rating_breakdown: breakdownResult.rows,
          reviews_by_stall: stallResult.rows,
        });
      });
    });
  });
};

module.exports.updateAdminReview = (reviewId, reviewData, callback) => {
  const sql = `
    UPDATE "Reviews"
    SET
      "rating" = $2,
      "taste_rating" = $3,
      "value_rating" = $4,
      "portion_rating" = $5,
      "wait_time_rating" = $6,
      "review_text" = $7,
      "review_tag" = $8,
      "review_tags" = $9,
      "best_time_to_buy" = $10,
      "review_photo_url" = $11
    WHERE "review_id" = $1
    RETURNING
      "review_id",
      "food_id";
  `;

  const values = [
    reviewId,
    reviewData.rating,
    reviewData.taste_rating,
    reviewData.value_rating,
    reviewData.portion_rating,
    reviewData.wait_time_rating,
    reviewData.review_text,
    reviewData.review_tag,
    reviewData.review_tags,
    reviewData.best_time_to_buy,
    reviewData.review_photo_url,
  ];

  pool.query(sql, values, (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};

module.exports.deleteAdminReview = (reviewId, callback) => {
  const sql = `
    DELETE FROM "Reviews"
    WHERE "review_id" = $1
    RETURNING
      "review_id",
      "food_id";
  `;

  pool.query(sql, [reviewId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};

module.exports.incrementAdminHelpfulCount = (reviewId, callback) => {
  const sql = `
    UPDATE "Reviews"
    SET "helpful_count" = COALESCE("helpful_count", 0) + 1
    WHERE "review_id" = $1
    RETURNING
      "review_id",
      "food_id",
      "helpful_count";
  `;

  pool.query(sql, [reviewId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};

module.exports.recalculateMenuStats = (foodId, callback) => {
  const sql = `
    UPDATE "Menu"
    SET
      "item_rating" = COALESCE(
        (
          SELECT ROUND(AVG("rating")::numeric, 1)
          FROM "Reviews"
          WHERE "food_id" = $1
        ),
        0
      ),
      "item_review_count" = COALESCE(
        (
          SELECT COUNT("review_id")::INT
          FROM "Reviews"
          WHERE "food_id" = $1
        ),
        0
      ),
      "taste_rating" = COALESCE(
        (
          SELECT ROUND(AVG("taste_rating")::numeric, 1)
          FROM "Reviews"
          WHERE "food_id" = $1
        ),
        0
      ),
      "value_rating" = COALESCE(
        (
          SELECT ROUND(AVG("value_rating")::numeric, 1)
          FROM "Reviews"
          WHERE "food_id" = $1
        ),
        0
      ),
      "portion_rating" = COALESCE(
        (
          SELECT ROUND(AVG("portion_rating")::numeric, 1)
          FROM "Reviews"
          WHERE "food_id" = $1
        ),
        0
      ),
      "wait_time_rating" = COALESCE(
        (
          SELECT ROUND(AVG("wait_time_rating")::numeric, 1)
          FROM "Reviews"
          WHERE "food_id" = $1
        ),
        0
      )
    WHERE "food_id" = $1
    RETURNING
      "food_id",
      "item_rating",
      "item_review_count",
      "taste_rating",
      "value_rating",
      "portion_rating",
      "wait_time_rating";
  `;

  pool.query(sql, [foodId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};

module.exports.recalculateStallStatsByFoodId = (foodId, callback) => {
  const sql = `
    UPDATE "Stalls"
    SET
      "rating" = COALESCE(
        (
          SELECT ROUND(AVG(r."rating")::numeric, 1)
          FROM "Reviews" r
          INNER JOIN "Menu" m
            ON r."food_id" = m."food_id"
          WHERE m."stall_id" = (
            SELECT "stall_id"
            FROM "Menu"
            WHERE "food_id" = $1
          )
        ),
        0
      ),
      "rating_count" = COALESCE(
        (
          SELECT COUNT(r."review_id")::INT
          FROM "Reviews" r
          INNER JOIN "Menu" m
            ON r."food_id" = m."food_id"
          WHERE m."stall_id" = (
            SELECT "stall_id"
            FROM "Menu"
            WHERE "food_id" = $1
          )
        ),
        0
      )
    WHERE "stall_id" = (
      SELECT "stall_id"
      FROM "Menu"
      WHERE "food_id" = $1
    )
    RETURNING
      "stall_id",
      "rating",
      "rating_count";
  `;

  pool.query(sql, [foodId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};
