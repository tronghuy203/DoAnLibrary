const router = require("express").Router();
const { documentController, upload } = require("../controllers/documentController");
const middlewareController = require("../controllers/middlewareController");

router.post("/upload", middlewareController.verifyToken, upload.single("file"), documentController.uploadDocument);

router.get("/",middlewareController.verifyToken,documentController.getAllDocuments);

router.get('/pending', middlewareController.verifyAdmin, documentController.getPendingDocuments);

router.get("/:id", middlewareController.verifyToken,documentController.getDocumentById);

router.get("/view/:id",middlewareController.verifyToken, documentController.viewDocument);

router.get("/download/:id",middlewareController.verifyToken, documentController.downloadDocument);

router.get('/user/:userId', middlewareController.verifyToken, documentController.getUserDocuments);

router.delete("/:id", middlewareController.verifyAdmin, documentController.deleteDocument);

router.put('/approve/:id', middlewareController.verifyAdmin, documentController.approveDocument);

router.put('/reject/:id', middlewareController.verifyAdmin, documentController.rejectDocument);

router.get("/stats/total", documentController.getTotalStats);

router.get("/stats/documents", documentController.getDocumentStats);

module.exports = router;
