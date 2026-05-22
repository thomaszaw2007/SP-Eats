const express = require("express");
const router = express.Router();

const foodStallModel = require("../models/FoodStall_model");

// GET /api/stalls
// Get all stalls, or search/filter stalls
router.get("/", (req, res, next) => {
  const search = req.query.search;
  const foodCourt = req.query.foodCourt;
  const category = req.query.category;
  const status = req.query.status;

  const sendResponse = (error, result) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Stalls retrieved successfully",
      count: result.rows.length,
      data: result.rows,
    });
  };

  if (search) {
    foodStallModel.searchStalls(search, sendResponse);
    return;
  }

  if (foodCourt) {
    foodStallModel.filterStallsByFoodCourt(foodCourt, sendResponse);
    return;
  }

  if (category) {
    foodStallModel.filterStallsByCuisine(category, sendResponse);
    return;
  }

  if (status) {
    foodStallModel.filterStallsByStatus(status, sendResponse);
    return;
  }

  foodStallModel.selectAllStalls(sendResponse);
});

// GET /api/stalls/:stall_id/menu
// Get all menu items from one stall
router.get("/:stall_id/menu", (req, res, next) => {
  const stallId = req.params.stall_id;

  foodStallModel.selectMenuByStallId(stallId, (error, result) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Stall menu retrieved successfully",
      count: result.rows.length,
      data: result.rows,
    });
  });
});

// GET /api/stalls/:stall_id
// Get one stall by ID
router.get("/:stall_id", (req, res, next) => {
  const stallId = req.params.stall_id;

  foodStallModel.selectStallById(stallId, (error, result) => {
    if (error) {
      next(error);
      return;
    }

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Stall not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Stall retrieved successfully",
      data: result.rows[0],
    });
  });
});

module.exports = router;