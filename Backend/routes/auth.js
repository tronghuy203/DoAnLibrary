const router = require("express").Router();
const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post("/verify-email", authController.verifyEmail);


router.post("/resend-verification", authController.resendVerificationCode);

router.post("/refresh",authController.requestRefreshToken);

router.post("/logout",middlewareController.verifyToken, authController.userLogout)


module.exports = router;