const pool = require('./db');

function addFilterCondition(conditions, values, value, sqlBuilder) {
  if (!value || value === 'all') {
    return;
  }

  values.push(value);
  conditions.push(sqlBuilder(values.length));
}

function getReviewBaseSelect() {
  return `
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
  `;
}

function getSortSql(sortOption) {
  if (sortOption === 'highest') {
    return 'ORDER BY r."rating" DESC, r."created_at" DESC';
  }

  if (sortOption === 'lowest') {
    return 'ORDER BY r."rating" ASC, r."created_at" DESC';
  }

  if (sortOption === 'dish') {
    return 'ORDER BY m."name" ASC, r."created_at" DESC';
  }

  return 'ORDER BY r."created_at" DESC, r."rating" DESC';
}

module.exports.selectReviews = (filters, callback) => {
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

  addFilterCondition(conditions, values, filters.tag, (index) => {
    return `LOWER(r."review_tag") = LOWER($${index})`;
  });

  addFilterCondition(conditions, values, filters.foodCourt, (index) => {
    return `
      (
        LOWER(fc."name") = LOWER($${index})
        OR LOWER('FC' || fc."foodcourt_id") = LOWER($${index})
        OR fc."foodcourt_id"::TEXT = $${index}
      )
    `;
  });

  if (filters.minRating) {
    values.push(filters.minRating);
    conditions.push(`r."rating" >= $${values.length}`);
  }

  const whereSql =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    ${getReviewBaseSelect()}
    ${whereSql}
    ${getSortSql(filters.sort)};
  `;

  pool.query(sql, values, (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows);
  });
};

module.exports.selectReviewsByFoodId = (foodId, callback) => {
  const sql = `
    ${getReviewBaseSelect()}
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

module.exports.selectReviewSummary = (callback) => {
  const summarySql = `
    SELECT
      COUNT(*)::INT AS total_reviews,
      ROUND(AVG("rating")::numeric, 1) AS average_rating
    FROM "Reviews";
  `;

  const topTagSql = `
    SELECT
      "review_tag",
      COUNT(*)::INT AS tag_count
    FROM "Reviews"
    GROUP BY "review_tag"
    ORDER BY tag_count DESC, "review_tag" ASC
    LIMIT 1;
  `;

  const topDishSql = `
    SELECT
      m."food_id",
      m."name" AS item_name,
      s."name" AS stall_name,
      fc."name" AS foodcourt_name,
      ROUND(AVG(r."rating")::numeric, 1) AS average_rating,
      COUNT(r."review_id")::INT AS review_count
    FROM "Reviews" r
    INNER JOIN "Menu" m
      ON r."food_id" = m."food_id"
    INNER JOIN "Stalls" s
      ON m."stall_id" = s."stall_id"
    INNER JOIN "FoodCourt" fc
      ON s."foodcourt_id" = fc."foodcourt_id"
    GROUP BY
      m."food_id",
      m."name",
      s."name",
      fc."name"
    ORDER BY
      average_rating DESC,
      review_count DESC,
      m."name" ASC
    LIMIT 1;
  `;

  const ratingBreakdownSql = `
    SELECT
      FLOOR("rating")::INT AS rating_level,
      COUNT(*)::INT AS review_count
    FROM "Reviews"
    GROUP BY FLOOR("rating")
    ORDER BY rating_level DESC;
  `;

  pool.query(summarySql, (summaryError, summaryResult) => {
    if (summaryError) {
      callback(summaryError, null);
      return;
    }

    pool.query(topTagSql, (tagError, tagResult) => {
      if (tagError) {
        callback(tagError, null);
        return;
      }

      pool.query(topDishSql, (dishError, dishResult) => {
        if (dishError) {
          callback(dishError, null);
          return;
        }

        pool.query(ratingBreakdownSql, (breakdownError, breakdownResult) => {
          if (breakdownError) {
            callback(breakdownError, null);
            return;
          }

          callback(null, {
            total_reviews: summaryResult.rows[0].total_reviews,
            average_rating: Number(summaryResult.rows[0].average_rating || 0),
            top_tag: tagResult.rows[0] || null,
            top_dish: dishResult.rows[0] || null,
            rating_breakdown: breakdownResult.rows,
          });
        });
      });
    });
  });
};