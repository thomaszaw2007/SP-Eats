const express = require('express');
const router = express.Router();

const foodStallController = require('../controllers/FoodStall_Controller');

//////////////////////////////////////////////////////
// FOOD STALL ROUTES
//////////////////////////////////////////////////////

router.get('/', foodStallController.readStalls);

// This route must be above /:stall_id
router.get('/:stall_id/menu', foodStallController.readMenuByStallId);

router.get('/:stall_id', foodStallController.readStallById);

module.exports = router;
