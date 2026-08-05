const menuItemModel = require('../models/MenuItem_model');

//////////////////////////////////////////////////////
// READ ALL MENU ITEMS / SEARCH / FILTER / SORT
//////////////////////////////////////////////////////
module.exports.readMenuItems = (req, res, next) => {
  const data = {
    search: req.query.search,
    category: req.query.category,
    stallId: req.query.stallId,
    available: req.query.available,
    popular: req.query.popular,
    sort: req.query.sort,
  };

  if (data.search) {
    menuItemModel.searchMenuItems(data, (error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  if (data.category) {
    menuItemModel.filterMenuItemsByCategory(data, (error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  if (data.stallId) {
    menuItemModel.filterMenuItemsByStallId(data, (error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  if (data.available === 'true' || data.available === 'false') {
    menuItemModel.filterMenuItemsByAvailability(data, (error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  if (data.popular === 'true') {
    menuItemModel.selectPopularMenuItems((error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  if (data.sort === 'price_asc') {
    menuItemModel.sortMenuItemsByPriceLow((error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  if (data.sort === 'price_desc') {
    menuItemModel.sortMenuItemsByPriceHigh((error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  if (data.sort === 'name_asc') {
    menuItemModel.sortMenuItemsByName((error, result) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        count: result.rows.length,
        data: result.rows,
      });
    });

    return;
  }

  menuItemModel.selectAllMenuItems((error, result) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Menu items retrieved successfully',
      count: result.rows.length,
      data: result.rows,
    });
  });
};

//////////////////////////////////////////////////////
// READ ONE MENU ITEM BY ID
//////////////////////////////////////////////////////
module.exports.readMenuItemById = (req, res, next) => {
  const data = {
    item_id: req.params.item_id || req.params.food_id,
  };

  if (!data.item_id) {
    res.status(400).json({
      success: false,
      message: 'Invalid menu item ID',
    });
    return;
  }

  menuItemModel.selectMenuItemById(data, (error, result) => {
    if (error) {
      next(error);
      return;
    }

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Menu item retrieved successfully',
      data: result.rows[0],
    });
  });
};
