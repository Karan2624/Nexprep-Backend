import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar, verifyEmail, resendVerificationEmail, updateUnverifiedEmail } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"),registerUser);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);
router.route("/update-unverified-email").post(updateUnverifiedEmail);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/me").get(verifyJWT,getCurrentUser);
router.route("/socket-token").get(verifyJWT, (req, res) => {
    res.status(200).json({ accessToken: req.cookies?.accessToken });
});

export default router;