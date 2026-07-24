const express = require('express');
const router = express.Router();

const controller = require('../controllers/Review_Controller');

router.get('/', controller.readAllReviews);
router.get('/summary', controller.readReviewSummary);
router.get('/menu/:food_id', controller.readReviewsByFoodId);

module.exports = router;