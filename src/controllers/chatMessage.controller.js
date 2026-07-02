import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ChatMessage } from "../models/chatMessage.model.js";
import { StudyGroup } from "../models/studyGroup.model.js";


const sendMessage = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Message content cannot be empty");
    }

    const group = await StudyGroup.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Study group not found");
    }

     if (!group.members.some(memberId => memberId.toString() === req.user._id.toString()))  {
        throw new ApiError(403, "You must join this study group to view messages");
    }

    let message = await ChatMessage.create({
        groupId,
        senderId: req.user._id,
        type: "user",
        content: content.trim()
    });

    message = await message.populate("senderId", "name avatar");
    const io = req.app.get("io");

    if(io){
        console.log(`Broadcasting to room: ${groupId.toString()}`);
        console.log(`Message payload:`, message.content);
        io.to(groupId).emit("receiveMessage",message);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, message, "Message sent successfully"));
});


const getGroupMessages = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const { page = 1, limit = 50 } = req.query; 


    const group = await StudyGroup.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Study group not found");
    }

    if (!group.members.some(memberId => memberId.toString() === req.user._id.toString()))  {
        throw new ApiError(403, "You must join this study group to view messages");
    }

    const messages = await ChatMessage.find({ groupId })
        .sort({ createdAt: -1 }) 
        .skip((page - 1) * limit) 
        .limit(parseInt(limit))  
        .populate("senderId", "name avatar"); 

    return res
        .status(200)
        .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

const updateMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Message content cannot be empty");
    }

    const message = await ChatMessage.findById(messageId);

    if (!message) {
        throw new ApiError(404, "Message not found");
    }


    if (message.type === "system") {
        throw new ApiError(403, "System messages cannot be edited");
    }

    if (message.senderId?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own messages");
    }

    message.content = content.trim();
    await message.save();

    await message.populate("senderId", "name avatar");
    const io = req.app.get("io");
    if (io) {
        io.to(message.groupId.toString()).emit("updateMessage", message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, message, "Message updated successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    if (message.type === "system") {
        throw new ApiError(403, "System messages cannot be deleted");
    }


    if (message.senderId?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own messages");
    }

    await ChatMessage.deleteOne({ _id: message._id });
    const io = req.app.get("io");
    if (io) {
        io.to(message.groupId.toString()).emit("deleteMessage", messageId);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Message deleted successfully"));
});


export { sendMessage, getGroupMessages, updateMessage, deleteMessage };