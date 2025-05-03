const router = require("express").Router();
const membershipController = require("../controllers/membershipController");
const middlewareController = require("../controllers/middlewareController");

router.get("/", membershipController.getMemberships);
router.post("/purchase", middlewareController.verifyToken, membershipController.purchaseMembership);
router.get("/vnpay_return", membershipController.vnpayReturn);
router.get("/status", middlewareController.verifyToken, membershipController.checkMembershipStatus);

module.exports = router;