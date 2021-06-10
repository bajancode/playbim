const express = require("express");
const router = express.Router();
const playgrounds = require("../controllers/playgrounds")
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validatePlayground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Playground = require("../models/playground");

router.route("/")
    .get(catchAsync(playgrounds.index))
    .post(isLoggedIn, upload.array("image"), validatePlayground, catchAsync(playgrounds.createPlayground))
   

router.get("/new", isLoggedIn, playgrounds.renderNewForm)

router.route("/:id")
    .get(catchAsync(playgrounds.showPlayground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validatePlayground, catchAsync(playgrounds.updatePlayground))
    .delete(isLoggedIn, isAuthor, catchAsync(playgrounds.deletePlayground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(playgrounds.renderEditForm));

module.exports = router; 
