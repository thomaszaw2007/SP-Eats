const express = require("express");
const router = express.Router();

const menuItemModel = require("../models/MenuItem_model");

// GET /api/menu-items
// Get all menu items, or search/filter/sort menu items
router.get("/", (req, res, next) => {
  const search = req.query.search;
  const category = req.query.category;
  const stallId = req.query.stallId;
  const available = req.query.available;
  const popular = req.query.popular;
  const sort = req.query.sort;

  const sendResponse = (error, result) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu items retrieved successfully",
      count: result.rows.length,
      data: result.rows,
    });
  };

  if (search) {
    menuItemModel.searchMenuItems(search, sendResponse);
    return;
  }

  if (category) {
    menuItemModel.filterMenuItemsByCategory(category, sendResponse);
    return;
  }

  if (stallId) {
    menuItemModel.filterMenuItemsByStallId(stallId, sendResponse);
    return;
  }

  if (available === "true") {
    menuItemModel.filterMenuItemsByAvailability(true, sendResponse);
    return;
  }

  if (available === "false") {
    menuItemModel.filterMenuItemsByAvailability(false, sendResponse);
    return;
  }

  if (popular === "true") {
    menuItemModel.selectPopularMenuItems(sendResponse);
    return;
  }

  if (sort === "price_asc") {
    menuItemModel.sortMenuItemsByPriceLow(sendResponse);
    return;
  }

  if (sort === "price_desc") {
    menuItemModel.sortMenuItemsByPriceHigh(sendResponse);
    return;
  }

  if (sort === "name_asc") {
    menuItemModel.sortMenuItemsByName(sendResponse);
    return;
  }

  menuItemModel.selectAllMenuItems(sendResponse);
});

// GET /api/menu-items/:item_id
// Get one menu item by ID
router.get("/:item_id", (req, res, next) => {
  const itemId = req.params.item_id;

  menuItemModel.selectMenuItemById(itemId, (error, result) => {
    if (error) {
      next(error);
      return;
    }

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu item retrieved successfully",
      data: result.rows[0],
    });
  });
});

module.exports = router;