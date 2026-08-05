const ReviewModel = require('../models/Review_model');

const MIN_REVIEW_TEXT_LENGTH = 20;

function cleanText(value) {
  return String(value || '').trim();
}

function getSortValue(value) {
  const sort = cleanText(value).toLowerCase();
  const allowedSorts = ['newest', 'highest', 'lowest', 'helpful', 'dish'];

  if (allowedSorts.includes(sort)) {
    return sort;
  }

  return 'newest';
}

function getMenuOptionSortValue(value) {
  const sort = cleanText(value).toLowerCase();
  const allowedSorts = ['popular', 'rating', 'price-low', 'price-high', 'quick', 'name'];

  if (allowedSorts.includes(sort)) {
    return sort;
  }

  return 'popular';
}

function getMinRating(value) {
  const rating = Number(value);

  if (!rating || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

function getRatingRange(value) {
  const ratingRange = cleanText(value).toLowerCase();

  if (ratingRange === 'below3') {
    return 'below3';
  }

  return '';
}

function getRequiredRating(value, fieldName) {
  const rating = Number(value);

  if (!rating || rating < 1 || rating > 5) {
    return {
      error: `${fieldName} must be between 1 and 5.`,
    };
  }

  return {
    value: Number(rating.toFixed(1)),
  };
}

function getOptionalRating(value, fallbackRating) {
  if (value === undefined || value === null || value === '') {
    return fallbackRating;
  }

  const rating = Number(value);

  if (!rating || rating < 1 || rating > 5) {
    return null;
  }

  return Number(rating.toFixed(1));
}

function getReviewTags(body) {
  if (Array.isArray(body.review_tags)) {
    return body.review_tags
      .map((tag) => cleanText(tag))
      .filter((tag) => tag.length > 0)
      .slice(0, 8);
  }

  if (typeof body.review_tags === 'string') {
    return body.review_tags
      .split(',')
      .map((tag) => cleanText(tag))
      .filter((tag) => tag.length > 0)
      .slice(0, 8);
  }

  const singleTag = cleanText(body.review_tag);

  if (singleTag) {
    return [singleTag];
  }

  return ['General'];
}

function validateCreateReviewBody(body) {
  const foodId = Number(body.food_id);
  const reviewerName = cleanText(body.reviewer_name || 'Anonymous Student');
  const overallRatingResult = getRequiredRating(body.rating, 'rating');
  const reviewText = cleanText(body.review_text);
  const bestTimeToBuy = cleanText(body.best_time_to_buy || 'Anytime');
  const reviewPhotoUrl = cleanText(body.review_photo_url);

  if (!foodId) {
    return {
      error: 'food_id is required and must be a valid number.',
    };
  }

  if (overallRatingResult.error) {
    return {
      error: overallRatingResult.error,
    };
  }

  const overallRating = overallRatingResult.value;
  const tasteRating = getOptionalRating(body.taste_rating, overallRating);
  const valueRating = getOptionalRating(body.value_rating, overallRating);
  const portionRating = getOptionalRating(body.portion_rating, overallRating);
  const waitTimeRating = getOptionalRating(body.wait_time_rating, overallRating);

  if (!tasteRating) {
    return {
      error: 'taste_rating must be between 1 and 5.',
    };
  }

  if (!valueRating) {
    return {
      error: 'value_rating must be between 1 and 5.',
    };
  }

  if (!portionRating) {
    return {
      error: 'portion_rating must be between 1 and 5.',
    };
  }

  if (!waitTimeRating) {
    return {
      error: 'wait_time_rating must be between 1 and 5.',
    };
  }

  if (!reviewText || reviewText.length < MIN_REVIEW_TEXT_LENGTH) {
    return {
      error: `review_text is required and must be at least ${MIN_REVIEW_TEXT_LENGTH} characters.`,
    };
  }

  if (reviewerName.length > 50) {
    return {
      error: 'reviewer_name must be 50 characters or less.',
    };
  }

  if (reviewText.length > 500) {
    return {
      error: 'review_text must be 500 characters or less.',
    };
  }

  if (reviewPhotoUrl && reviewPhotoUrl.length > 500) {
    return {
      error: 'review_photo_url must be 500 characters or less.',
    };
  }

  const reviewTags = getReviewTags(body);
  const mainReviewTag = reviewTags[0] || 'General';

  return {
    data: {
      food_id: foodId,
      reviewer_name: reviewerName,
      rating: overallRating,
      taste_rating: tasteRating,
      value_rating: valueRating,
      portion_rating: portionRating,
      wait_time_rating: waitTimeRating,
      review_text: reviewText,
      review_tag: mainReviewTag,
      review_tags: reviewTags,
      best_time_to_buy: bestTimeToBuy,
      review_photo_url: reviewPhotoUrl || null,
    },
  };
}

module.exports.readAllReviews = (req, res, next) => {
  const filters = {
    search: cleanText(req.query.search),
    tag: cleanText(req.query.tag || 'all'),
    foodCourt: cleanText(req.query.foodCourt || 'all'),
    minRating: getMinRating(req.query.minRating),
    ratingRange: getRatingRange(req.query.ratingRange),
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

module.exports.readReviewMenuOptions = (req, res, next) => {
  const filters = {
    search: cleanText(req.query.search),
    foodCourt: cleanText(req.query.foodCourt || 'all'),
    category: cleanText(req.query.category || 'all'),
    availableOnly: req.query.availableOnly === 'true' || req.query.availableOnly === '1',
    sort: getMenuOptionSortValue(req.query.sort),
  };

  ReviewModel.selectReviewMenuOptions(filters, (error, menuItems) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Review menu options retrieved successfully.',
      filters,
      count: menuItems.length,
      data: menuItems,
    });
  });
};

module.exports.readReviewFilterOptions = (req, res, next) => {
  ReviewModel.selectReviewFilterOptions((error, options) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Review filter options retrieved successfully.',
      data: options,
    });
  });
};

module.exports.createReview = (req, res, next) => {
  const validation = validateCreateReviewBody(req.body);

  if (validation.error) {
    res.status(400).json({
      message: validation.error,
    });
    return;
  }

  const reviewData = validation.data;

  ReviewModel.selectMenuItemByFoodId(reviewData.food_id, (menuError, menuItem) => {
    if (menuError) {
      next(menuError);
      return;
    }

    if (!menuItem) {
      res.status(404).json({
        message: 'Menu item not found. Review was not created.',
      });
      return;
    }

    ReviewModel.insertReview(reviewData, (insertError, insertedReview) => {
      if (insertError) {
        next(insertError);
        return;
      }

      ReviewModel.updateMenuReviewStats(reviewData.food_id, (menuStatsError, updatedMenuStats) => {
        if (menuStatsError) {
          next(menuStatsError);
          return;
        }

        ReviewModel.updateStallReviewStatsByFoodId(
          reviewData.food_id,
          (stallStatsError, updatedStallStats) => {
            if (stallStatsError) {
              next(stallStatsError);
              return;
            }

            ReviewModel.selectReviewById(insertedReview.review_id, (selectError, fullReview) => {
              if (selectError) {
                next(selectError);
                return;
              }

              res.status(201).json({
                message: 'Review created successfully. Menu and stall rating stats updated.',
                data: {
                  review: fullReview || insertedReview,
                  menu_item: {
                    food_id: menuItem.food_id,
                    item_name: menuItem.name || menuItem.item_name,
                    stall_id: menuItem.stall_id,
                    stall_name: menuItem.stall_name,
                    foodcourt_id: menuItem.foodcourt_id,
                    foodcourt_name: menuItem.foodcourt_name,
                  },
                  updated_menu_stats: updatedMenuStats,
                  updated_stall_stats: updatedStallStats,
                },
              });
            });
          },
        );
      });
    });
  });
};

module.exports.addHelpfulToReview = (req, res, next) => {
  const reviewId = Number(req.params.review_id);

  if (!reviewId) {
    res.status(400).json({
      message: 'Invalid review_id.',
    });
    return;
  }

  ReviewModel.incrementHelpfulCount(reviewId, (error, updatedReview) => {
    if (error) {
      next(error);
      return;
    }

    if (!updatedReview) {
      res.status(404).json({
        message: 'Review not found.',
      });
      return;
    }

    res.status(200).json({
      message: 'Review marked as helpful.',
      data: updatedReview,
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
