const router = require("express").Router();
const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");

router.post("/google", authController.googleLogin);

router.post("/facebook", authController.facebookLogin);

router.post("/register", authController.registerUser);

router.post("/forgot-password", authController.forgotPassword);

router.post("/resend-reset-code", authController.resendResetCode);

router.post("/verify-reset-code", authController.verifyResetCode);

router.post("/reset-password", authController.resetPassword);

router.post("/login", authController.loginUser);

router.post("/verify-email", authController.verifyEmail);

router.post("/resend-verification", authController.resendVerificationCode);

router.post("/refresh",authController.requestRefreshToken);

router.post("/logout",middlewareController.verifyToken, authController.userLogout)


module.exports = router;