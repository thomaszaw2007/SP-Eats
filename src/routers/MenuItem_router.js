const express = require("express");
const router = express.Router();

const menuItemController = require("../controllers/menuItemController");

//////////////////////////////////////////////////////
// MENU ITEM ROUTES
//////////////////////////////////////////////////////

// GET ALL / SEARCH / FILTER / SORT MENU ITEMS
router.get("/", menuItemController.readMenuItems);

// GET ONE MENU ITEM BY ID
router.get("/:item_id", menuItemController.readMenuItemById);

module.exports = router;