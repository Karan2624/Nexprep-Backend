import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { DailyTask } from "../models/dailyTask.model.js";

const createDailyTask = asyncHandler(async (req, res) => {
    const { 
        title, 
        type, 
        priority, 
        targetDate, 
        estimatedMinutes, 
        timeSpentMinutes, 
        linkedPyqId 
    } = req.body;

    if (!title || !type || !targetDate) {
        throw new ApiError(400, "Title, type, and targetDate are required fields");
    }

    const task = await DailyTask.create({
        userId: req.user._id, 
        title,
        type,
        priority: priority || "Medium",
        targetDate,
        estimatedMinutes: estimatedMinutes || 0,
        timeSpentMinutes: timeSpentMinutes || 0,
        linkedPyqId: linkedPyqId || null
    });

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Daily task created successfully"));
});

const deleteDailyTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;


    const task = await DailyTask.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this task");
    }


    await DailyTask.deleteOne({ _id: task._id });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Daily task deleted successfully"));
});


const getDailyTasks = asyncHandler(async (req, res) => {
    const { date } = req.query; 
    
    let query = { userId: req.user._id };

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query.targetDate = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    const tasks = await DailyTask.find(query)
        .populate("linkedPyqId", "title difficulty")
        .sort({ createdAt: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Daily tasks fetched successfully"));
});

export { createDailyTask, deleteDailyTask, getDailyTasks };