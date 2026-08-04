const pool = require('./db');

const foodCourtMarkers = {
  1: {
    marker_number: 1,
    marker_label: 'FC1',
    map_x: 88.5,
    map_y: 72.5,
  },
  2: {
    marker_number: 2,
    marker_label: 'FC2',
    map_x: 82.5,
    map_y: 46.5,
  },
  3: {
    marker_number: 3,
    marker_label: 'FC3',
    map_x: 60.5,
    map_y: 52.5,
  },
  4: {
    marker_number: 4,
    marker_label: 'FC4',
    map_x: 48.8,
    map_y: 19.2,
  },
  5: {
    marker_number: 5,
    marker_label: 'FC5',
    map_x: 45.8,
    map_y: 45.2,
  },
  6: {
    marker_number: 6,
    marker_label: 'FC6',
    map_x: 33.2,
    map_y: 20.5,
  },
};

module.exports.selectFoodMapMarkers = (callback) => {
  const foodCourtSql = `
    SELECT
      fc."foodcourt_id",
      fc."name",
      fc."location",
      fc."description",
      COUNT(DISTINCT s."stall_id") AS stall_count,
      COUNT(
        DISTINCT CASE
          WHEN s."opening_status" = 'open' THEN s."stall_id"
        END
      ) AS open_stall_count,
      ROUND(AVG(r."rating")::numeric, 1) AS average_rating
    FROM "FoodCourt" fc
    LEFT JOIN "Stalls" s
      ON fc."foodcourt_id" = s."foodcourt_id"
    LEFT JOIN "Menu" m
      ON s."stall_id" = m."stall_id"
    LEFT JOIN "Reviews" r
      ON m."food_id" = r."food_id"
    GROUP BY
      fc."foodcourt_id",
      fc."name",
      fc."location",
      fc."description"
    ORDER BY fc."foodcourt_id" ASC;
  `;

  const popularDishSql = `
    SELECT
      fc."foodcourt_id",
      m."food_id",
      m."name" AS item_name,
      m."price",
      m."category",
      m."image_url",
      m."is_popular",
      COALESCE(item_stats.item_rating, 0) AS item_rating,
      COALESCE(item_stats.item_review_count, 0) AS item_review_count,
      s."stall_id",
      s."name" AS stall_name
    FROM "FoodCourt" fc
    INNER JOIN "Stalls" s
      ON fc."foodcourt_id" = s."foodcourt_id"
    INNER JOIN "Menu" m
      ON s."stall_id" = m."stall_id"
    LEFT JOIN (
      SELECT
        "food_id",
        ROUND(AVG("rating")::numeric, 1) AS item_rating,
        COUNT("review_id")::INT AS item_review_count
      FROM "Reviews"
      GROUP BY "food_id"
    ) item_stats
      ON m."food_id" = item_stats."food_id"
    WHERE m."is_available" = TRUE
    ORDER BY
      fc."foodcourt_id" ASC,
      m."is_popular" DESC,
      COALESCE(item_stats.item_rating, 0) DESC,
      COALESCE(item_stats.item_review_count, 0) DESC,
      m."price" ASC;
  `;

  pool.query(foodCourtSql, (foodCourtError, foodCourtResult) => {
    if (foodCourtError) {
      callback(foodCourtError, null);
      return;
    }

    pool.query(popularDishSql, (dishError, dishResult) => {
      if (dishError) {
        callback(dishError, null);
        return;
      }

      const popularDishMap = {};

      dishResult.rows.forEach((dish) => {
        if (!popularDishMap[dish.foodcourt_id]) {
          popularDishMap[dish.foodcourt_id] = [];
        }

        if (popularDishMap[dish.foodcourt_id].length < 3) {
          popularDishMap[dish.foodcourt_id].push({
            food_id: dish.food_id,
            item_name: dish.item_name,
            price: Number(dish.price || 0),
            category: dish.category,
            image_url: dish.image_url,
            is_popular: dish.is_popular,
            stall_id: dish.stall_id,
            stall_name: dish.stall_name,
            rating: Number(dish.item_rating || 0),
            rating_count: Number(dish.item_review_count || 0),
          });
        }
      });

      const foodCourts = foodCourtResult.rows.map((foodCourt) => {
        const marker = foodCourtMarkers[foodCourt.foodcourt_id] || {
          marker_number: foodCourt.foodcourt_id,
          marker_label: `FC${foodCourt.foodcourt_id}`,
          map_x: 50,
          map_y: 50,
        };

        return {
          foodcourt_id: foodCourt.foodcourt_id,
          name: foodCourt.name,
          location: foodCourt.location,
          description: foodCourt.description,
          stall_count: Number(foodCourt.stall_count || 0),
          open_stall_count: Number(foodCourt.open_stall_count || 0),
          average_rating: Number(foodCourt.average_rating || 0),
          marker_number: marker.marker_number,
          marker_label: marker.marker_label,
          map_x: marker.map_x,
          map_y: marker.map_y,
          popular_dishes: popularDishMap[foodCourt.foodcourt_id] || [],
        };
      });

      callback(null, foodCourts);
    });
  });
};
