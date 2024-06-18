const express = require("express");
const { verifyAuth } = require("../middleware/common.js");
const {getProfile, updateProfile, validatePassword, updatePassword} = require("../controllers/profileController.js")

const router = express.Router();

// get Profile Data
router.get("/getInfo", verifyAuth, getProfile)
router.post("/updateInfo", verifyAuth, updateProfile)
// Validate Password
router.post("/validatePassword", verifyAuth, validatePassword);
// Update Password
router.post("/updatePassword", verifyAuth, updatePassword);


module.exports = router;