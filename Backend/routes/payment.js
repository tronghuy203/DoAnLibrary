const router = require("express").Router();
const paymentController = require("../controllers/paymentController");
const middlewareController = require("../controllers/middlewareController");


router.get("/revenue-by-type", middlewareController.verifyAdmin, paymentController.getRevenueByType);
router.get("/revenue-by-monthly", middlewareController.verifyAdmin, paymentController.getMonthlyRevenue);

module.exports = router;