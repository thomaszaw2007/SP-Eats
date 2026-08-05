const express = require('express');
const router = express.Router();

const reviewAdminController = require('../controllers/ReviewAdmin_Controller');

router.get('/', reviewAdminController.readAdminReviews);
router.get('/summary', reviewAdminController.readAdminSummary);

router.put('/:review_id', reviewAdminController.updateAdminReview);
router.delete('/:review_id', reviewAdminController.deleteAdminReview);
router.patch('/:review_id/helpful', reviewAdminController.markHelpfulAdminReview);

module.exports = router;
