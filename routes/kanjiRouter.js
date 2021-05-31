const express = require("express");
const kanjiController = require("../controllers/kanjiController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(kanjiController.getAllKanjis)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    kanjiController.createKanji
  );

router
  .route("/:id")
  .get(kanjiController.getKanji)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    kanjiController.updateKanji
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    kanjiController.deleteKanji
  );

module.exports = router;
