const router = require("express").Router();
const paymentController = require("../controllers/paymentController");
const middlewareController = require("../controllers/middlewareController");


router.get("/revenue-by-type", middlewareController.verifyAdmin, paymentController.getRevenueByType);

module.exports = router;