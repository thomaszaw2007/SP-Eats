const ReviewAdminModel = require('../models/ReviewAdmin_model');

function cleanText(value) {
  return String(value || '').trim();
}

function getRatingFilter(value) {
  const filter = cleanText(value);

  if (['all', '5', '4', '3', 'below3'].includes(filter)) {
    return filter;
  }

  return 'all';
}

function getRating(value, fieldName) {
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

function validateUpdateReviewBody(body) {
  const ratingResult = getRating(body.rating, 'rating');
  const tasteResult = getRating(body.taste_rating, 'taste_rating');
  const valueResult = getRating(body.value_rating, 'value_rating');
  const portionResult = getRating(body.portion_rating, 'portion_rating');
  const waitResult = getRating(body.wait_time_rating, 'wait_time_rating');

  if (ratingResult.error) {
    return {
      error: ratingResult.error,
    };
  }

  if (tasteResult.error) {
    return {
      error: tasteResult.error,
    };
  }

  if (valueResult.error) {
    return {
      error: valueResult.error,
    };
  }

  if (portionResult.error) {
    return {
      error: portionResult.error,
    };
  }

  if (waitResult.error) {
    return {
      error: waitResult.error,
    };
  }

  const reviewText = cleanText(body.review_text);
  const bestTimeToBuy = cleanText(body.best_time_to_buy || 'Anytime');
  const reviewPhotoUrl = cleanText(body.review_photo_url);
  const reviewTags = getReviewTags(body);
  const mainReviewTag = reviewTags[0] || 'General';

  if (reviewText.length < 8) {
    return {
      error: 'review_text must be at least 8 characters.',
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

  return {
    data: {
      rating: ratingResult.value,
      taste_rating: tasteResult.value,
      value_rating: valueResult.value,
      portion_rating: portionResult.value,
      wait_time_rating: waitResult.value,
      review_text: reviewText,
      review_tag: mainReviewTag,
      review_tags: reviewTags,
      best_time_to_buy: bestTimeToBuy,
      review_photo_url: reviewPhotoUrl || null,
    },
  };
}

function refreshConnectedStats(foodId, next, callback) {
  ReviewAdminModel.recalculateMenuStats(foodId, (menuError, menuStats) => {
    if (menuError) {
      next(menuError);
      return;
    }

    ReviewAdminModel.recalculateStallStatsByFoodId(foodId, (stallError, stallStats) => {
      if (stallError) {
        next(stallError);
        return;
      }

      callback({
        menu_stats: menuStats,
        stall_stats: stallStats,
      });
    });
  });
}

module.exports.readAdminReviews = (req, res, next) => {
  const filters = {
    search: cleanText(req.query.search),
    ratingFilter: getRatingFilter(req.query.rating),
  };

  ReviewAdminModel.selectAdminReviews(filters, (error, reviews) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Admin reviews retrieved successfully.',
      filters,
      count: reviews.length,
      data: reviews,
    });
  });
};

module.exports.readAdminSummary = (req, res, next) => {
  ReviewAdminModel.selectAdminSummary((error, summary) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Admin review summary retrieved successfully.',
      data: summary,
    });
  });
};

module.exports.updateAdminReview = (req, res, next) => {
  const reviewId = Number(req.params.review_id);

  if (!reviewId) {
    res.status(400).json({
      message: 'Invalid review_id.',
    });
    return;
  }

  const validation = validateUpdateReviewBody(req.body);

  if (validation.error) {
    res.status(400).json({
      message: validation.error,
    });
    return;
  }

  ReviewAdminModel.updateAdminReview(reviewId, validation.data, (updateError, updatedReview) => {
    if (updateError) {
      next(updateError);
      return;
    }

    if (!updatedReview) {
      res.status(404).json({
        message: 'Review not found.',
      });
      return;
    }

    refreshConnectedStats(updatedReview.food_id, next, (stats) => {
      ReviewAdminModel.selectAdminReviewById(reviewId, (selectError, fullReview) => {
        if (selectError) {
          next(selectError);
          return;
        }

        res.status(200).json({
          message: 'Review updated successfully. Ratings recalculated.',
          data: {
            review: fullReview,
            updated_stats: stats,
          },
        });
      });
    });
  });
};

module.exports.deleteAdminReview = (req, res, next) => {
  const reviewId = Number(req.params.review_id);

  if (!reviewId) {
    res.status(400).json({
      message: 'Invalid review_id.',
    });
    return;
  }

  ReviewAdminModel.deleteAdminReview(reviewId, (deleteError, deletedReview) => {
    if (deleteError) {
      next(deleteError);
      return;
    }

    if (!deletedReview) {
      res.status(404).json({
        message: 'Review not found.',
      });
      return;
    }

    refreshConnectedStats(deletedReview.food_id, next, (stats) => {
      res.status(200).json({
        message: 'Review deleted successfully. Ratings recalculated.',
        data: {
          deleted_review: deletedReview,
          updated_stats: stats,
        },
      });
    });
  });
};

module.exports.markHelpfulAdminReview = (req, res, next) => {
  const reviewId = Number(req.params.review_id);

  if (!reviewId) {
    res.status(400).json({
      message: 'Invalid review_id.',
    });
    return;
  }

  ReviewAdminModel.incrementAdminHelpfulCount(reviewId, (error, updatedReview) => {
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
      message: 'Review helpful count updated successfully.',
      data: updatedReview,
    });
  });
};
