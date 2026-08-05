const FoodMapModel = require('../models/FoodMap_model');

module.exports.readFoodMapMarkers = (req, res, next) => {
  FoodMapModel.selectFoodMapMarkers((error, foodCourts) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Food court map markers retrieved successfully.',
      data: foodCourts,
    });
  });
};
