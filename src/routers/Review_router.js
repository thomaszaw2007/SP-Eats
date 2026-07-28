const express = require('express');
const router = express.Router();

const controller = require('../controllers/Review_Controller');

router.get('/', controller.readAllReviews);
router.post('/', controller.createReview);

router.get('/summary', controller.readReviewSummary);
router.get('/filter-options', controller.readReviewFilterOptions);
router.get('/menu-options', controller.readReviewMenuOptions);
router.get('/menu/:food_id', controller.readReviewsByFoodId);

router.patch('/:review_id/helpful', controller.addHelpfulToReview);
router.post('/:review_id/helpful', controller.addHelpfulToReview);

module.exports = router;