const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const middleware = require("../controllers/middlewareController");

router.get("/stats/:type", reviewController.getAllReviewStats);
router.get("/:type/:itemId", reviewController.getReviews);
router.post("/", middleware.verifyToken, reviewController.addReview);
router.put("/:id", middleware.verifyToken, reviewController.updateReview);
router.delete("/:id", middleware.verifyToken, reviewController.deleteReview);

router.post("/reply/:reviewId", middleware.verifyToken, reviewController.addReply);
router.put("/reply/:id", middleware.verifyToken, reviewController.updateReply);
router.delete("/reply/:id", middleware.verifyToken, reviewController.deleteReply);

module.exports = router;
