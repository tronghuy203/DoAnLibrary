const router = require("express").Router();
const borrowController = require("../controllers/borrowController");
const middlewareController = require("../controllers/middlewareController");

router.post("/request", middlewareController.verifyToken, borrowController.requestBorrow);

router.get("/my-requests", middlewareController.verifyToken, borrowController.getMyBorrowRequests);

router.get("/request/:requestId", middlewareController.verifyToken, borrowController.getBorrowRequestById);

router.post("/pay-rental/:requestId", middlewareController.verifyToken, borrowController.payRentalFeeAndCreateBorrow);

router.put("/confirm-pickup/:borrowId", middlewareController.verifyAdmin, borrowController.confirmPickup);

router.put("/confirm-return/:borrowId", middlewareController.verifyToken, borrowController.confirmReturn);

router.post("/pay-penalty/:penaltyId", middlewareController.verifyToken, borrowController.payPenalty);

router.get("/all", middlewareController.verifyAdmin, borrowController.getAllBorrowRecords);

router.get("/revenue/total", middlewareController.verifyAdmin, borrowController.getTotalRevenue);

router.get("/revenue/daily", middlewareController.verifyAdmin, borrowController.getDailyRevenue);


module.exports = router;
