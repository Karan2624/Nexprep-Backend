import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createCompanyPyq, deletePyq, getPyqById, getPyqsByCompany, updatePyq } from "../controllers/companyPyq.controller.js";

const router = Router()

router.route("/create-pyq").post(verifyJWT,createCompanyPyq);
router.route("/delete/:pyqId").delete(verifyJWT,deletePyq);
router.route("/update/:pyqId").patch(verifyJWT,updatePyq);
router.route("/:companyId").get(verifyJWT,getPyqsByCompany);
router.route("/me/:pyqId").get(verifyJWT,getPyqById);

export default router;