const express = require('express');
const router = express.Router();

const controller = require('../controllers/Quiz_Controller');

router.get('/options', controller.readQuizOptions);

router.get('/recommendations', controller.getQuizRecommendations);
router.post('/recommendations', controller.getQuizRecommendations);

module.exports = router;
