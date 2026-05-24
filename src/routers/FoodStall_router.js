const express = require("express");
const router = express.Router();

const foodStallController = require("../controllers/FoodStall_Controller");

//////////////////////////////////////////////////////
// STALL ROUTES
//////////////////////////////////////////////////////

// GET ALL / SEARCH / FILTER STALLS
router.get("/", foodStallController.readStalls);

// GET MENU ITEMS FROM ONE STALL
// IMPORTANT: this must be before router.get("/:stall_id")
router.get("/:stall_id/menu", foodStallController.readMenuByStallId);

// GET ONE STALL BY ID
router.get("/:stall_id", foodStallController.readStallById);

module.exports = router;