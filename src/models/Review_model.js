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
      m."variation",
      m."price",
      m."category",
      m."image_url",
      m."item_rating",
      m."item_review_count",
      m."taste_rating" AS menu_taste_rating,
      m."value_rating" AS menu_value_rating,
      m."portion_rating" AS menu_portion_rating,
      m."wait_time_rating" AS menu_wait_time_rating,

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

  if (sortOption === 'helpful') {
    return 'ORDER BY r."helpful_count" DESC, r."rating" DESC, r."created_at" DESC';
  }

  if (sortOption === 'dish') {
    return 'ORDER BY m."name" ASC, r."created_at" DESC';
  }

  return 'ORDER BY r."created_at" DESC, r."rating" DESC';
}

function getMenuOptionSortSql(sortOption) {
  if (sortOption === 'rating') {
    return 'ORDER BY m."item_rating" DESC, m."item_review_count" DESC, m."name" ASC';
  }

  if (sortOption === 'price-low') {
    return 'ORDER BY m."price" ASC, m."item_rating" DESC';
  }

  if (sortOption === 'price-high') {
    return 'ORDER BY m."price" DESC, m."item_rating" DESC';
  }

  if (sortOption === 'quick') {
    return 'ORDER BY m."prep_time_minutes" ASC, m."item_rating" DESC';
  }

  if (sortOption === 'name') {
    return 'ORDER BY m."name" ASC';
  }

  return 'ORDER BY m."is_popular" DESC, m."order_count" DESC, m."item_rating" DESC';
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
        OR EXISTS (
          SELECT 1
          FROM unnest(COALESCE(r."review_tags", ARRAY[r."review_tag"])) AS tag
          WHERE LOWER(tag) LIKE LOWER('%' || $${index} || '%')
        )
        OR LOWER(m."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(s."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(fc."name") LIKE LOWER('%' || $${index} || '%')
      )
    `;
  });

  addFilterCondition(conditions, values, filters.tag, (index) => {
    return `
      (
        LOWER(r."review_tag") = LOWER($${index})
        OR EXISTS (
          SELECT 1
          FROM unnest(COALESCE(r."review_tags", ARRAY[r."review_tag"])) AS tag
          WHERE LOWER(tag) = LOWER($${index})
        )
      )
    `;
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

  if (filters.ratingRange === 'below3') {
    conditions.push('r."rating" < 3');
  } else if (filters.minRating) {
    values.push(filters.minRating);
    conditions.push(`r."rating" >= $${values.length}`);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

module.exports.selectReviewById = (reviewId, callback) => {
  const sql = `
    ${getReviewBaseSelect()}
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

module.exports.selectReviewsByFoodId = (foodId, callback) => {
  const sql = `
    ${getReviewBaseSelect()}
    WHERE r."food_id" = $1
    ORDER BY
      r."helpful_count" DESC,
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

module.exports.selectMenuItemByFoodId = (foodId, callback) => {
  const sql = `
    SELECT
      m."food_id",
      m."name",
      m."variation",
      m."description",
      m."price",
      m."stall_id",
      m."foodcourt_id",
      m."category",
      m."image_url",
      m."is_available",
      m."item_rating",
      m."item_review_count",
      s."name" AS stall_name,
      fc."name" AS foodcourt_name
    FROM "Menu" m
    INNER JOIN "Stalls" s
      ON m."stall_id" = s."stall_id"
    INNER JOIN "FoodCourt" fc
      ON m."foodcourt_id" = fc."foodcourt_id"
    WHERE m."food_id" = $1;
  `;

  pool.query(sql, [foodId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};

module.exports.selectReviewMenuOptions = (filters, callback) => {
  const conditions = [];
  const values = [];

  addFilterCondition(conditions, values, filters.search, (index) => {
    return `
      (
        LOWER(m."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."variation") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."description") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."category") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(s."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(fc."name") LIKE LOWER('%' || $${index} || '%')
      )
    `;
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

  addFilterCondition(conditions, values, filters.category, (index) => {
    return `LOWER(m."category") = LOWER($${index})`;
  });

  if (filters.availableOnly) {
    conditions.push('m."is_available" = TRUE');
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      m."food_id",
      m."name" AS item_name,
      m."variation",
      m."description",
      m."price",
      m."category",
      m."image_url",
      m."is_available",
      m."is_popular",

      m."item_rating",
      m."item_review_count",
      m."taste_rating",
      m."value_rating",
      m."portion_rating",
      m."wait_time_rating",

      m."calories",
      m."nutrition_level",
      m."carb_level",
      m."protein_level",
      m."fat_level",
      m."sugar_level",
      m."spice_level",
      m."allergen_info",
      m."portion_size",

      m."prep_time_minutes",
      m."meal_type",
      m."dietary_tag",
      m."flavour_profile",
      m."student_need",
      m."temperature_type",
      m."is_budget_friendly",
      m."is_quick_bite",
      m."is_student_favourite",
      m."is_customisable",
      m."customisation_options",
      m."menu_notes",

      s."stall_id",
      s."name" AS stall_name,
      s."cuisine_type",

      fc."foodcourt_id",
      fc."name" AS foodcourt_name,
      fc."location" AS foodcourt_location
    FROM "Menu" m
    INNER JOIN "Stalls" s
      ON m."stall_id" = s."stall_id"
    INNER JOIN "FoodCourt" fc
      ON m."foodcourt_id" = fc."foodcourt_id"
    ${whereSql}
    ${getMenuOptionSortSql(filters.sort)};
  `;

  pool.query(sql, values, (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows);
  });
};

module.exports.selectReviewFilterOptions = (callback) => {
  const tagSql = `
    SELECT DISTINCT tag
    FROM (
      SELECT unnest(COALESCE("review_tags", ARRAY["review_tag"])) AS tag
      FROM "Reviews"
    ) AS review_tag_list
    WHERE tag IS NOT NULL AND tag <> ''
    ORDER BY tag ASC;
  `;

  const foodCourtSql = `
    SELECT
      "foodcourt_id",
      "name" AS foodcourt_name
    FROM "FoodCourt"
    ORDER BY "foodcourt_id" ASC;
  `;

  const categorySql = `
    SELECT DISTINCT
      "category"
    FROM "Menu"
    WHERE "category" IS NOT NULL AND "category" <> ''
    ORDER BY "category" ASC;
  `;

  pool.query(tagSql, (tagError, tagResult) => {
    if (tagError) {
      callback(tagError, null);
      return;
    }

    pool.query(foodCourtSql, (foodCourtError, foodCourtResult) => {
      if (foodCourtError) {
        callback(foodCourtError, null);
        return;
      }

      pool.query(categorySql, (categoryError, categoryResult) => {
        if (categoryError) {
          callback(categoryError, null);
          return;
        }

        callback(null, {
          tags: tagResult.rows.map((row) => row.tag),
          food_courts: foodCourtResult.rows,
          categories: categoryResult.rows.map((row) => row.category),
          rating_filters: [
            {
              label: 'Any Rating',
              value: '',
            },
            {
              label: '4★+ Good',
              value: '4',
            },
            {
              label: '3★+ Okay',
              value: '3',
            },
            {
              label: 'Below 3★ Needs Improvement',
              value: 'below3',
            },
          ],
          sort_options: [
            {
              label: 'Newest',
              value: 'newest',
            },
            {
              label: 'Highest Rating',
              value: 'highest',
            },
            {
              label: 'Lowest Rating',
              value: 'lowest',
            },
            {
              label: 'Most Helpful',
              value: 'helpful',
            },
            {
              label: 'Dish Name',
              value: 'dish',
            },
          ],
        });
      });
    });
  });
};

module.exports.insertReview = (reviewData, callback) => {
  const sql = `
    INSERT INTO "Reviews" (
      "food_id",
      "reviewer_name",
      "rating",
      "taste_rating",
      "value_rating",
      "portion_rating",
      "wait_time_rating",
      "review_text",
      "review_tag",
      "review_tags",
      "best_time_to_buy",
      "review_photo_url",
      "helpful_count"
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, 0
    )
    RETURNING
      "review_id",
      "food_id";
  `;

  const values = [
    reviewData.food_id,
    reviewData.reviewer_name,
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

    callback(null, result.rows[0]);
  });
};

module.exports.updateMenuReviewStats = (foodId, callback) => {
  const sql = `
    UPDATE "Menu"
    SET
      "item_rating" = review_stats.average_rating,
      "item_review_count" = review_stats.review_count,
      "taste_rating" = review_stats.average_taste,
      "value_rating" = review_stats.average_value,
      "portion_rating" = review_stats.average_portion,
      "wait_time_rating" = review_stats.average_wait
    FROM (
      SELECT
        "food_id",
        ROUND(AVG("rating")::numeric, 1) AS average_rating,
        COUNT("review_id")::INT AS review_count,
        ROUND(AVG("taste_rating")::numeric, 1) AS average_taste,
        ROUND(AVG("value_rating")::numeric, 1) AS average_value,
        ROUND(AVG("portion_rating")::numeric, 1) AS average_portion,
        ROUND(AVG("wait_time_rating")::numeric, 1) AS average_wait
      FROM "Reviews"
      WHERE "food_id" = $1
      GROUP BY "food_id"
    ) AS review_stats
    WHERE "Menu"."food_id" = review_stats."food_id"
    RETURNING
      "Menu"."food_id",
      "Menu"."item_rating",
      "Menu"."item_review_count",
      "Menu"."taste_rating",
      "Menu"."value_rating",
      "Menu"."portion_rating",
      "Menu"."wait_time_rating";
  `;

  pool.query(sql, [foodId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0]);
  });
};

module.exports.incrementHelpfulCount = (reviewId, callback) => {
  const sql = `
    UPDATE "Reviews"
    SET "helpful_count" = COALESCE("helpful_count", 0) + 1
    WHERE "review_id" = $1
    RETURNING
      "review_id",
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

module.exports.updateStallReviewStatsByFoodId = (foodId, callback) => {
  const sql = `
    UPDATE "Stalls"
    SET
      "rating" = stall_stats.average_rating,
      "rating_count" = stall_stats.review_count
    FROM (
      SELECT
        m."stall_id",
        ROUND(AVG(r."rating")::numeric, 1) AS average_rating,
        COUNT(r."review_id")::INT AS review_count
      FROM "Menu" m
      INNER JOIN "Reviews" r
        ON m."food_id" = r."food_id"
      WHERE m."stall_id" = (
        SELECT "stall_id"
        FROM "Menu"
        WHERE "food_id" = $1
        LIMIT 1
      )
      GROUP BY m."stall_id"
    ) AS stall_stats
    WHERE "Stalls"."stall_id" = stall_stats."stall_id"
    RETURNING
      "Stalls"."stall_id",
      "Stalls"."rating",
      "Stalls"."rating_count";
  `;

  pool.query(sql, [foodId], (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows[0] || null);
  });
};

module.exports.selectReviewSummary = (callback) => {
  const summarySql = `
    SELECT
      COUNT(*)::INT AS total_reviews,
      ROUND(AVG("rating")::numeric, 1) AS average_rating,
      ROUND(AVG("taste_rating")::numeric, 1) AS average_taste_rating,
      ROUND(AVG("value_rating")::numeric, 1) AS average_value_rating,
      ROUND(AVG("portion_rating")::numeric, 1) AS average_portion_rating,
      ROUND(AVG("wait_time_rating")::numeric, 1) AS average_wait_time_rating,
      COALESCE(SUM("helpful_count"), 0)::INT AS total_helpful_count
    FROM "Reviews";
  `;

  const topTagSql = `
    SELECT
      tag AS review_tag,
      COUNT(*)::INT AS tag_count
    FROM (
      SELECT unnest(COALESCE("review_tags", ARRAY["review_tag"])) AS tag
      FROM "Reviews"
    ) AS review_tag_list
    GROUP BY tag
    ORDER BY tag_count DESC, tag ASC
    LIMIT 1;
  `;

  const topDishSql = `
    SELECT
      m."food_id",
      m."name" AS item_name,
      s."name" AS stall_name,
      fc."name" AS foodcourt_name,
      ROUND(AVG(r."rating")::numeric, 1) AS average_rating,
      COUNT(r."review_id")::INT AS review_count,
      COALESCE(SUM(r."helpful_count"), 0)::INT AS helpful_count
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
      helpful_count DESC,
      m."name" ASC
    LIMIT 1;
  `;

  const ratingBreakdownSql = `
    SELECT
      CASE
        WHEN "rating" >= 4 THEN '4★+ Good'
        WHEN "rating" >= 3 THEN '3★+ Okay'
        ELSE 'Below 3★ Needs Improvement'
      END AS rating_group,
      COUNT(*)::INT AS review_count
    FROM "Reviews"
    GROUP BY rating_group
    ORDER BY
      CASE
        WHEN rating_group = '4★+ Good' THEN 1
        WHEN rating_group = '3★+ Okay' THEN 2
        ELSE 3
      END;
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
            average_taste_rating: Number(summaryResult.rows[0].average_taste_rating || 0),
            average_value_rating: Number(summaryResult.rows[0].average_value_rating || 0),
            average_portion_rating: Number(summaryResult.rows[0].average_portion_rating || 0),
            average_wait_time_rating: Number(summaryResult.rows[0].average_wait_time_rating || 0),
            total_helpful_count: summaryResult.rows[0].total_helpful_count,
            top_tag: tagResult.rows[0] || null,
            top_dish: dishResult.rows[0] || null,
            rating_breakdown: breakdownResult.rows,
          });
        });
      });
    });
  });
};
