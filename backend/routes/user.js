const express = require("express");
const { getClockStatus, getTime, clockEvents, getAttendance, regularize, getRegularizedRequests, updateRegularize, deleteRegularize, availableLeaves, getAvailableLeaves, applyLeave, getLeaves, updateLeaves, deleteLeave} = require("../controllers/userController")
const { verifyAuth } = require("../middleware/common.js");

const router = express.Router();

router.get("/clockStatus", verifyAuth, getClockStatus);
router.get("/time", verifyAuth, getTime);
router.post("/clockEvents", verifyAuth, clockEvents);
router.get("/attendance", verifyAuth, getAttendance);
router.get("/requestedLeaves", verifyAuth, getLeaves);
router.post("/regularizeAttendance", verifyAuth, regularize);
router.get("/reqestedRegularized", verifyAuth, getRegularizedRequests);
router.post("/updateRegularize", verifyAuth, updateRegularize);
router.post("/deleteRegularize", verifyAuth, deleteRegularize);
router.get("/getAvailableLeaves", verifyAuth, getAvailableLeaves);
router.post("/availableLeaves", verifyAuth, availableLeaves);
router.post("/applyLeave", verifyAuth, applyLeave);
router.post("/updateLeaves", verifyAuth, updateLeaves);
router.post("/deleteLeave", verifyAuth, deleteLeave);



module.exports = router;