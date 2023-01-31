const {
  createSauce,
  modifySauce,
  deleteSauce,
  getAllSauces,
  getOneSauce,
  likeSauce,
} = require("../controllers/sauce");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth"); // Authentifier les pages du site (middleware)
const multer = require("../middleware/multer-config"); // destination des images (middleware)

router.post("/", auth, multer, createSauce);
router.put("/:id", auth, multer, modifySauce);
router.delete("/:id", auth, deleteSauce);
router.post("/:id/like", auth, likeSauce);

router.get("/", auth, getAllSauces);
router.get("/:id", auth, getOneSauce);

module.exports = router;
