const express = require("express");
const router = express.Router();

const menuItemController = require("../controllers/MenuItem_Controller");

//////////////////////////////////////////////////////
// MENU ITEM ROUTES
//////////////////////////////////////////////////////

router.get("/", menuItemController.readMenuItems);
router.get("/:item_id", menuItemController.readMenuItemById);

module.exports = router;