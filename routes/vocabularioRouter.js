const express = require("express");
const vocabularioController = require("../controllers/vocabularioController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(vocabularioController.getAllVocabularios)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    vocabularioController.createVocabulario
  );

router
  .route("/:id")
  .get(vocabularioController.getVocabulario)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    vocabularioController.updateVocabulario
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    vocabularioController.deleteVocabulario
  );

module.exports = router;
