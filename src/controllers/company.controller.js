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

const getAllCompanies = asyncHandler(async (req, res) => {

    const companies = await Company.find({})
        .select("name logo normalizedName")
        .sort({ name: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, companies, "Companies fetched successfully"));
});

const getCompanyById = asyncHandler(async (req, res) => {
    console.log("params =", req.params);
    console.log("companyId =", req.params.companyId);

    const { companyId } = req.params;

    const company = await Company.findById(companyId);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                company,
                "Company details fetched successfully"
            )
        );
});

export { createCompany, getAllCompanies, getCompanyById };
