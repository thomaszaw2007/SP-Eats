const ReviewModel = require('../models/Review_model');

function cleanText(value) {
  return String(value || '').trim();
}

function getSortValue(value) {
  const sort = cleanText(value).toLowerCase();
  const allowedSorts = ['newest', 'highest', 'lowest', 'dish'];

  if (allowedSorts.includes(sort)) {
    return sort;
  }

  return 'newest';
}

function getMinRating(value) {
  const rating = Number(value);

  if (!rating || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

module.exports.readAllReviews = (req, res, next) => {
  const filters = {
    search: cleanText(req.query.search),
    tag: cleanText(req.query.tag || 'all'),
    foodCourt: cleanText(req.query.foodCourt || 'all'),
    minRating: getMinRating(req.query.minRating),
    sort: getSortValue(req.query.sort),
  };

  ReviewModel.selectReviews(filters, (error, reviews) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Review hub reviews retrieved successfully.',
      filters,
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

module.exports.readReviewSummary = (req, res, next) => {
  ReviewModel.selectReviewSummary((error, summary) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Review hub summary retrieved successfully.',
      data: summary,
    });
  });
};