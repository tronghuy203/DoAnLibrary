const router = require("express").Router();
const {bookController, upload } = require("../controllers/bookController");
const middlewareController = require("../controllers/middlewareController");

router.post("/", middlewareController.verifyAdmin, upload.single("image"), bookController.createBook);

router.get("/", bookController.getAllBooks);

router.get("/:id", bookController.getBookById);

router.put("/:id", middlewareController.verifyAdmin, bookController.updateBook);

router.delete("/:id", middlewareController.verifyAdmin, bookController.deleteBook);

module.exports = router;
