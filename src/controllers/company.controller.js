import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { Company } from "../models/company.model.js";

const createCompany = asyncHandler(async(req,res) => {
    const {name} = req.body;
    if (!name || !name.trim()) {
        throw new ApiError(400, "Please write name of company");
    }

    const existingCompany = await Company.findOne({
        normalizedName: name.trim().toLowerCase()
    });

    if (existingCompany) {
        throw new ApiError(409, "Company already exists");
    }
    let logo = null;

    if (req.file?.path) {
        logo = await uploadOnCloudinary(req.file.path);
    }

    const company = await Company.create({
        name : name,
        logo : logo?.url || null,
        createdBy : req.user?._id
    });

    return res
    .status(201)
    .json(
        new ApiResponse(200,company,"Company created successfully")
    );
})

export {createCompany};