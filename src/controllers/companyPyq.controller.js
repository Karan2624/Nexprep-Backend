import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CompanyPyq } from "../models/companyPyqs.model.js";

const createCompanyPyq = asyncHandler(async(req,res)=> {
    const {companyId,title,description,tags,sampleTestCase,difficulty,yearAsked} = req.body;
    
     if(!companyId || !title || !description ) {
        throw new ApiError(400,"company,title and description are required");
    }
    const alreadyexist = await CompanyPyq.findOne({
        companyId,
        title : {$regex : new RegExp(`^${title}`,"i")}
    });
    if(alreadyexist){
        throw new ApiError(409,"the given title question already exist");
    }

   

    const companyPyq = await CompanyPyq.create({
        companyId,
        authorId : req.user?._id,
        title,
        description,
        tags : tags ?? [],
        sampleTestCase : sampleTestCase ?? [],
        difficulty,
        yearAsked: yearAsked || null
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,companyPyq,"Pyq question created successfully")
    );

})

const deletePyq = asyncHandler(async(req,res)=> {
    const {pyqId} = req.params;
    const pyq = await CompanyPyq.findById(pyqId);
    if(!pyq){
        throw new ApiError(404,"this pyq doesn't exist");
    }
    if(pyq.authorId.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to modify this pyq");
    }
    await CompanyPyq.deleteOne({_id : pyq._id});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"pyq has been deleted")
    )
})


const updatePyq = asyncHandler(async (req, res) => {
    const { pyqId } = req.params;

    const pyq = await CompanyPyq.findById(pyqId);

    if (!pyq) {
        throw new ApiError(404, "This PYQ doesn't exist");
    }

    if (pyq.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to modify this PYQ"
        );
    }

    const allowedFields = [
        "title",
        "description",
        "difficulty",
        "yearAsked",
        "tags",
        "sampleTestCase"
    ];

    const updates = {};
    console.log(req.body);
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(
            400,
            "Please provide at least one field to update"
        );
    }

    const updatedPyq = await CompanyPyq.findByIdAndUpdate(
        pyqId,
        updates,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPyq,
            "PYQ updated successfully"
        )
    );
});


export {createCompanyPyq,deletePyq,updatePyq};