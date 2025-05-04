const middlewareController = require("../controllers/middlewareController");
const {userController, upload} = require("../controllers/userController");

const router = require("express").Router();

router.get("/",middlewareController.verifyToken, userController.getAllUsers);

router.put("/:id",middlewareController.verifyTokenAndAdminAuth, userController.updateUser)

router.delete("/:id",middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);

router.put("/update-profile/:id", middlewareController.verifyToken, userController.updateProfile);

router.get("/history/:userId", middlewareController.verifyToken, userController.getBorrowHistory);

router.get("/admin", middlewareController.verifyToken, userController.getAdmin);

router.post("/upload-avatar", middlewareController.verifyToken, upload.single("avatar"), userController.uploadAvatar);

module.exports = router;