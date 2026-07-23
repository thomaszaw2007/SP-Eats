const ReviewModel = require('../models/Review_model');

module.exports.readAllReviews = (req, res, next) => {
  ReviewModel.selectAllReviews((error, reviews) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Review hub reviews retrieved successfully.',
      count: reviews.length,
      data: reviews,
    });
  });
};

module.exports.readReviewsByFoodId = (req, res, next) => {
  const foodId = Number(req.params.food_id);

  if (!foodId) {
    res.status(400).json({
      message: 'Invalid food_id.',
    });
    return;
  }

  ReviewModel.selectReviewsByFoodId(foodId, (error, reviews) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Menu item reviews retrieved successfully.',
      food_id: foodId,
      count: reviews.length,
      data: reviews,
    });
  });
};