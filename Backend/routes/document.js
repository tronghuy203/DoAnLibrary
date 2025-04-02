const router = require("express").Router();
const { documentController, upload } = require("../controllers/documentController");
const middlewareController = require("../controllers/middlewareController");

router.post("/upload", middlewareController.verifyToken, upload.single("file"), documentController.uploadDocument);

router.get("/", documentController.getAllDocuments);

router.get("/:id", documentController.getDocumentById);

router.get("/view/:id", documentController.viewDocument);

router.get("/download/:id", documentController.downloadDocument);

router.delete("/:id", middlewareController.verifyAdmin, documentController.deleteDocument);

router.get("/stats/total", documentController.getTotalStats);

router.get("/stats/documents", documentController.getDocumentStats);

module.exports = router;
