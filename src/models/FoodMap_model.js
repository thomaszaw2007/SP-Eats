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
  const sql = `
    SELECT
      fc."foodcourt_id",
      fc."name",
      fc."location",
      fc."description",
      COUNT(s."stall_id") AS stall_count,
      COUNT(
        CASE
          WHEN s."opening_status" = 'open' THEN 1
        END
      ) AS open_stall_count,
      ROUND(AVG(s."rating")::numeric, 1) AS average_rating
    FROM "FoodCourt" fc
    LEFT JOIN "Stalls" s
      ON fc."foodcourt_id" = s."foodcourt_id"
    GROUP BY
      fc."foodcourt_id",
      fc."name",
      fc."location",
      fc."description"
    ORDER BY fc."foodcourt_id" ASC;
  `;

  pool.query(sql, (error, result) => {
    if (error) {
      callback(error, null);
      return;
    }

    const foodCourts = result.rows.map((foodCourt) => {
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
      };
    });

    callback(null, foodCourts);
  });
};