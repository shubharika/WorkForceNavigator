const express = require("express");
const {userLogin, googleLogin, userLogout} = require("../controllers/authController.js");
const { verifyAuth } = require("../middleware/common.js");


const router = express.Router();

router.post("/login", userLogin);
router.post("/google", googleLogin);
router.post('/logout', verifyAuth, userLogout)

module.exports = router;