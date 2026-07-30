const pool = require('./db');

function addFilterCondition(conditions, values, value, sqlBuilder) {
  if (!value || value === 'all') {
    return;
  }

  values.push(value);
  conditions.push(sqlBuilder(values.length));
}

module.exports.selectQuizOptions = (callback) => {
  const foodCourtSql = `
    SELECT
      "foodcourt_id",
      "name" AS foodcourt_name,
      "location"
    FROM "FoodCourt"
    ORDER BY "foodcourt_id" ASC;
  `;

  const categorySql = `
    SELECT DISTINCT
      "category"
    FROM "Menu"
    WHERE "category" IS NOT NULL
      AND "category" <> ''
    ORDER BY "category" ASC;
  `;

  const priceSql = `
    SELECT
      MIN("price") AS min_price,
      MAX("price") AS max_price
    FROM "Menu";
  `;

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

      pool.query(priceSql, (priceError, priceResult) => {
        if (priceError) {
          callback(priceError, null);
          return;
        }

        callback(null, {
          food_courts: foodCourtResult.rows,
          categories: categoryResult.rows.map((row) => row.category),
          price_range: {
            min_price: Number(priceResult.rows[0].min_price || 0),
            max_price: Number(priceResult.rows[0].max_price || 0),
          },
          budget_options: [
            {
              label: 'Any Budget',
              value: 'any',
            },
            {
              label: 'Budget Meal',
              value: 'low',
            },
            {
              label: 'Normal Budget',
              value: 'medium',
            },
            {
              label: 'Treat Myself',
              value: 'high',
            },
          ],
          time_options: [
            {
              label: 'Any Time',
              value: 'any',
            },
            {
              label: 'Quick Bite',
              value: 'quick',
            },
            {
              label: 'Normal Wait',
              value: 'normal',
            },
          ],
          mood_options: [
            {
              label: 'Anything',
              value: 'any',
            },
            {
              label: 'Comfort Food',
              value: 'comfort',
            },
            {
              label: 'Healthy Choice',
              value: 'healthy',
            },
            {
              label: 'Filling Meal',
              value: 'filling',
            },
            {
              label: 'Spicy Craving',
              value: 'spicy',
            },
            {
              label: 'Study Drink',
              value: 'study',
            },
            {
              label: 'Safe Choice',
              value: 'safe',
            },
          ],
          spice_options: [
            {
              label: 'Any Spice',
              value: 'any',
            },
            {
              label: 'Not Spicy',
              value: 'not-spicy',
            },
            {
              label: 'Mild / Medium',
              value: 'mild',
            },
            {
              label: 'Spicy',
              value: 'spicy',
            },
          ],
          dietary_options: [
            {
              label: 'Any Dietary',
              value: 'any',
            },
            {
              label: 'Halal-friendly',
              value: 'halal',
            },
            {
              label: 'Vegetarian',
              value: 'vegetarian',
            },
            {
              label: 'Vegan',
              value: 'vegan',
            },
          ],
          temperature_options: [
            {
              label: 'Any Temperature',
              value: 'any',
            },
            {
              label: 'Hot Meal',
              value: 'hot',
            },
            {
              label: 'Cold Drink / Cold Option',
              value: 'cold',
            },
          ],
          sort_options: [
            {
              label: 'Best Match',
              value: 'best-match',
            },
            {
              label: 'Highest Rating',
              value: 'rating',
            },
            {
              label: 'Lowest Price',
              value: 'price-low',
            },
            {
              label: 'Fastest Prep',
              value: 'quick',
            },
            {
              label: 'Most Popular',
              value: 'popular',
            },
          ],
        });
      });
    });
  });
};

module.exports.selectQuizMenuCandidates = (filters, callback) => {
  const conditions = [];
  const values = [];

  if (filters.availableOnly) {
    conditions.push('m."is_available" = TRUE');
  }

  addFilterCondition(conditions, values, filters.search, (index) => {
    return `
      (
        LOWER(m."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."variation") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."description") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."category") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."nutrition_level") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."spice_level") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."dietary_tag") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."flavour_profile") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(m."student_need") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(s."name") LIKE LOWER('%' || $${index} || '%')
        OR LOWER(s."cuisine_type") LIKE LOWER('%' || $${index} || '%')
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

  if (filters.maxPrice) {
    values.push(filters.maxPrice);
    conditions.push(`m."price" <= $${values.length}`);
  }

  const whereSql =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

      m."calories",
      m."nutrition_level",
      m."carb_level",
      m."protein_level",
      m."fat_level",
      m."sugar_level",
      m."spice_level",
      m."allergen_info",
      m."portion_size",

      m."item_rating",
      m."item_review_count",
      m."taste_rating",
      m."value_rating",
      m."portion_rating",
      m."wait_time_rating",
      m."order_count",

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
      s."description" AS stall_description,
      s."cuisine_type",
      s."halal",
      s."vegetarian",
      s."vegan",
      s."opening_status",
      s."estimated_wait_time",
      s."rating" AS stall_rating,
      s."rating_count" AS stall_rating_count,

      fc."foodcourt_id",
      fc."name" AS foodcourt_name,
      fc."location" AS foodcourt_location,
      fc."description" AS foodcourt_description
    FROM "Menu" m
    INNER JOIN "Stalls" s
      ON m."stall_id" = s."stall_id"
    INNER JOIN "FoodCourt" fc
      ON m."foodcourt_id" = fc."foodcourt_id"
    ${whereSql}
    ORDER BY
      m."is_student_favourite" DESC,
      m."is_popular" DESC,
      m."order_count" DESC,
      m."item_rating" DESC,
      m."price" ASC;
  `;

  pool.query(sql, values, (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    callback(null, result.rows);
  });
};