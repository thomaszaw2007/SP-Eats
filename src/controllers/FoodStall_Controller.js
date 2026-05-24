const foodStallModel = require("../models/FoodStall_model");

//////////////////////////////////////////////////////
// READ ALL STALLS / SEARCH / FILTER
//////////////////////////////////////////////////////
module.exports.readStalls = (req, res, next) =>
{
    const data = {
        search: req.query.search,
        foodCourt: req.query.foodCourt,
        category: req.query.category,
        status: req.query.status
    };

    if (data.search)
    {
        foodStallModel.searchStalls(data, (error, result) =>
        {
            if (error)
            {
                next(error);
                return;
            }

            res.status(200).json({
                success: true,
                message: "Stalls retrieved successfully",
                count: result.rows.length,
                data: result.rows
            });
        });

        return;
    }

    if (data.foodCourt)
    {
        foodStallModel.filterStallsByFoodCourt(data, (error, result) =>
        {
            if (error)
            {
                next(error);
                return;
            }

            res.status(200).json({
                success: true,
                message: "Stalls retrieved successfully",
                count: result.rows.length,
                data: result.rows
            });
        });

        return;
    }

    if (data.category)
    {
        foodStallModel.filterStallsByCuisine(data, (error, result) =>
        {
            if (error)
            {
                next(error);
                return;
            }

            res.status(200).json({
                success: true,
                message: "Stalls retrieved successfully",
                count: result.rows.length,
                data: result.rows
            });
        });

        return;
    }

    if (data.status)
    {
        foodStallModel.filterStallsByStatus(data, (error, result) =>
        {
            if (error)
            {
                next(error);
                return;
            }

            res.status(200).json({
                success: true,
                message: "Stalls retrieved successfully",
                count: result.rows.length,
                data: result.rows
            });
        });

        return;
    }

    foodStallModel.selectAllStalls((error, result) =>
    {
        if (error)
        {
            next(error);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Stalls retrieved successfully",
            count: result.rows.length,
            data: result.rows
        });
    });
};

//////////////////////////////////////////////////////
// READ ONE STALL BY ID
//////////////////////////////////////////////////////
module.exports.readStallById = (req, res, next) =>
{
    const data = {
        stall_id: req.params.stall_id
    };

    foodStallModel.selectStallById(data, (error, result) =>
    {
        if (error)
        {
            next(error);
            return;
        }

        if (result.rows.length === 0)
        {
            res.status(404).json({
                success: false,
                message: "Stall not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Stall retrieved successfully",
            data: result.rows[0]
        });
    });
};

//////////////////////////////////////////////////////
// READ MENU ITEMS FROM ONE STALL
//////////////////////////////////////////////////////
module.exports.readMenuByStallId = (req, res, next) =>
{
    const data = {
        stall_id: req.params.stall_id
    };

    foodStallModel.selectMenuByStallId(data, (error, result) =>
    {
        if (error)
        {
            next(error);
            return;
        }

        res.status(200).json({
            success: true,
            message: "Stall menu retrieved successfully",
            count: result.rows.length,
            data: result.rows
        });
    });
};