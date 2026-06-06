import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createCompany } from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/create-company").post(verifyJWT,upload.single("logo"),createCompany)

export default router;