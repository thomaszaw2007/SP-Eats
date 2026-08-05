const express = require('express');
const router = express.Router();

const controller = require('../controllers/FoodMap_Controller');

router.get('/', controller.readFoodMapMarkers);

module.exports = router;
