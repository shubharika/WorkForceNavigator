const { sendResponse, createError } = require("./baseController.js");
const adminServices = require("../services/adminServices.js");

/**
  * @param {userId, role} req
  * @param {*} res
  * @returns {data: [{id ,name, email, designation, date_of_joining, salary},.....]}
   */
const getEmployees = async (req, res, next) => {
  try {
    const data = await adminServices.getEmployees(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Employees List sent successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};
/**
  * @param {userId, role} req
  * @param {*} res
  * @returns {data: {availableToday}}
   */
const availableToday = async (req, res, next) => {
  try {
    const data = await adminServices.availableToday(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Active Employees List sent successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};
/**
  * @param {userId, role, body: {id}} req
  * @param {*} res
  * @returns {data: {name, email, role, status, designation, date_of_joining, salary}}
*/
const getEmployeeInfo = async (req, res, next) => {
  try {
    const data = await adminServices.getEmployeeInfo(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Employee Info sent successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};

/**
   *
   * @param {userId, role, body: {id, name, email, role, status, designation, dateOfJoining, salary}} req
   * @param {*} res
   * @returns {data: {}}
   */
const updateEmployeeInfo = async (req, res, next) => {
  try {
    const data = await adminServices.updateEmployeeInfo(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Employee Info Updated successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};

/**
   *
   * @param {userId, role, body: {id}} req
   * @param {*} res
   * @returns {data: {}}
   */
const deleteEmployee = async (req, res, next) => {
  try {
    const data = await adminServices.deleteEmployee(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Employee Deleted successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};
/**
   * @param {userId, roleId} req
   * @param {*} res 
   * @returns {success, message, data: [{value: , label: }, {value: , label: }]}
   */
const getRoles = async (req, res, next) => {
    try {
      const data = await adminServices.getRoles(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Role Options sent successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };
  /**
   * @param {userId, roleId} req
   * @param {*} res 
   * @returns {success, message, data: [{value: , label: }, {value: , label: }]}
   */
const getStatus = async (req, res, next) => {
    try {
      const data = await adminServices.getStatus(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Status Options sent successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };
  /**
   * @param {userId, roleId} req
   * @param {*} res 
   * @returns {success, message, data: [{value: , label: }, {value: , label: }]}
   */
const getDesignation = async (req, res, next) => {
    try {
      const data = await adminServices.getDesignation(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Designations Options sent successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };
/**
   * @param {userId, role, body:{emp_id, name, email, password, role, designation}} req
   * @param {*} res 
   * @returns {success, message, data: {}}
   */
const addEmployee = async (req, res, next) => {
    try {
      const data = await adminServices.addEmployee(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Employee added successfully!", data.data));
      }
    } catch (error) {
      console.log("Error in Controller: ",error);
      next(createError(400, `Bad Request: ${error.message}`));
    }
  };

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {id}} req
   * @param {*} res
   * @returns {data: [{ id, date, clockIn, clockOut, attendanceStatus, status },...]}
   */
const getRegularizedRequests = async (req, res, next) => {
  try {
    const data = await adminServices.getRegularizedRequests(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Employee added successfully!", data.data));
    }
  } catch (error) {
    console.log("Error in Controller: ",error);
    next(createError(400, `Bad Request: ${error.message}`));
  }
};

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {id, userId, status}} req
   * @param {*} res
   * @returns {data: {}}
   */
const updateRegularizedRequest = async (req, res, next) => {
  try {
    const data = await adminServices.updateRegularizedRequest(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Request updated successfully!", data.data));
    }
  } catch (error) {
    console.log("Error in Controller: ",error);
    next(createError(400, `Bad Request: ${error.message}`));
  }
};

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {userId}} req
   * @param {*} res
   * @returns {data: [{ userId, id, leaveType, startDate, endDate, appliedLeaves, status },...]}
   */
const getLeaves = async (req, res, next) => {
  try {
    const data = await adminServices.getLeaves(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("List of Leaves sent successfully!", data.data));
    }
  } catch (error) {
    console.log("Error in Controller: ",error);
    next(createError(400, `Bad Request: ${error.message}`));
  }
};

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body:{userId, id, leaveType, availableLeaves, appliedLeaves, status}} req
   * @param {*} res
   * @returns {data: {}}
   */
const updateLeave = async (req, res, next) => {
  try {
    const data = await adminServices.updateLeave(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Requested Leave updated successfully!", data.data));
    }
  } catch (error) {
    console.log("Error in Controller: ",error);
    next(createError(400, `Bad Request: ${error.message}`));
  }
};

/**
   * @param {userId, roleId} req
   * @param {*} res 
   * @returns {success, message, data: {name, wrk_hrs, paid_policy, casual_policy, sick_policy, salary_cycle}}
   */
const getSettings = async (req, res, next) => {
    try {
      const data = await adminServices.getSettings(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Settings Data sent successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };

  

/**
   * @param {userId, role, body:{workingHours, paidLeavePolicy, casualLeavePolicy, sickLeavePolicy, salaryCycle,}} req
   * @param {*} res 
   * @returns {success, message, data: {}}
   */
const updateSettings = async(req, res, next) => {
    try {
        const data = await adminServices.updateSettings(req, res);
        if (data.data === null) {
          next(createError(data.status, data.message));
        } else {
          res.status(200).send(sendResponse("Settings Updated successfully!", data.data));
        }
      } catch (error) {
        console.log("Error in Controller: ",error);
        next(createError(400, `Bad Request: ${error.message}`));
      }
}


module.exports = {
  getEmployees,
  availableToday,
  getEmployeeInfo,
  updateEmployeeInfo,
  deleteEmployee,
  getRoles,
  getStatus,
  getDesignation,
  addEmployee,
  getRegularizedRequests,
  updateRegularizedRequest,
  getLeaves,
  updateLeave,
  getSettings,
  updateSettings,
};