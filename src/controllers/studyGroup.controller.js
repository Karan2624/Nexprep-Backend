import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { StudyGroup } from "../models/studyGroup.model.js";

const getAllStudyGroups = asyncHandler(async (req, res) => {
    const groups = await StudyGroup.aggregate([
        {
            $project: {
                name: 1,
                topic: 1,
                pinnedMessage: 1,
                memberCount: { $size: "$members" }, 
                isMember: { $in: [req.user._id, "$members"] } 
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, groups, "Study groups fetched successfully"));
});

const joinGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await StudyGroup.findByIdAndUpdate(
        groupId,
        { $addToSet: { members: req.user._id } },
        { returnDocument: "after" }
    );

    if (!group) {
        throw new ApiError(404, "Study group not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, `Successfully joined ${group.name}`));
});


const leaveGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await StudyGroup.findByIdAndUpdate(
        groupId,
        { $pull: { members: req.user._id } },
        { returnDocument: "after" }
    );

    if (!group) {
        throw new ApiError(404, "Study group not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, `Successfully left ${group.name}`));
});

export { getAllStudyGroups, joinGroup, leaveGroup };