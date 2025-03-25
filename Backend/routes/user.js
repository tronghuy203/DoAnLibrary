const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");

const router = require("express").Router();

router.get("/",middlewareController.verifyToken, userController.getAllUsers);

router.put("/:id",middlewareController.verifyTokenAndAdminAuth, userController.updateUser)

router.delete("/:id",middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);

router.put("/update-profile/:id", middlewareController.verifyToken, userController.updateProfile);

module.exports = router;