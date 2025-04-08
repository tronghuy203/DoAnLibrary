const categoryController = require("../controllers/categoryController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

router.post("/", middlewareController.verifyAdmin ,categoryController.createCategory);

router.get("/", categoryController.getAllCategory);

router.get("/:id", categoryController.getCategoryById);

router.put("/:id", middlewareController.verifyAdmin, categoryController.updateCategory);

router.delete("/:id", middlewareController.verifyAdmin, categoryController.deleteCategory);

module.exports = router;