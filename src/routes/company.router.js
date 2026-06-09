import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createCompany, getAllCompanies, getCompanyById } from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.route("/create-company").post(verifyJWT,upload.single("logo"),createCompany)
router.route("/me").get(verifyJWT,getAllCompanies);
router.route("/me/:companyId").get(verifyJWT,getCompanyById);

export default router;