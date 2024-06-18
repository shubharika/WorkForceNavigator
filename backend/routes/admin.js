const express = require("express");
const {getEmployees, availableToday, getEmployeeInfo, updateEmployeeInfo, deleteEmployee, getRoles, getStatus, getDesignation, addEmployee,  getRegularizedRequests, updateRegularizedRequest, getLeaves, updateLeave, getSettings, updateSettings} = require("../controllers/adminController")
const { verifyAuth } = require("../middleware/common.js");


const router = express.Router();

router.get("/getEmployees", verifyAuth, getEmployees);
router.get("/activeToday", verifyAuth, availableToday);
router.post("/getEmployeeInfo", verifyAuth, getEmployeeInfo);
router.post("/updateEmployeeInfo", verifyAuth, updateEmployeeInfo);
router.post("/deleteEmployee", verifyAuth, deleteEmployee);
// get roles options
router.get("/getRoles", verifyAuth, getRoles);
// get status options
router.get("/getStatus", verifyAuth, getStatus);
// get designation options
router.get("/getDesignation", verifyAuth, getDesignation);
// Add Employee
router.post("/addEmployee", verifyAuth, addEmployee);

router.post("/reqestedRegularized", verifyAuth, getRegularizedRequests);
router.put("/updateRegularize", verifyAuth, updateRegularizedRequest);

router.post("/requestedLeaves", verifyAuth, getLeaves);
router.put("/updateLeave", verifyAuth, updateLeave);
// Settings
router.get("/settings", verifyAuth, getSettings);
router.put("/updateSettings",verifyAuth, updateSettings);
// // Attendance
// router.post("/getAttendance", verifyAuth, getAttendance );
// router.post("/calculateSalary", verifyAuth, calculateSalary );


module.exports = router;