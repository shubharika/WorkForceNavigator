const { sendResponse, createError } = require("./baseController.js");
const UserServices = require("../services/userServices.js");

/**
  * @param {userId, role} req
  * @param {*} res
  * @returns {data: {clockStatus}}
   */
const getClockStatus = async (req, res, next) => {
    try {
      const data = await UserServices.getClockStatus(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Latest Clock Status!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };

/**
  * @param {userId, role} req
  * @param {*} res
  * @returns {data: { entryTime, totalSeconds }}
   */
const getTime = async (req, res, next) => {
  try {
    const data = await UserServices.getTime(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Time Sent!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};

/**
  * @param {userId, role, body:{ clockStatus }} req
  * @param {*} res
  * @returns {data: {}}
   */
const clockEvents = async (req, res, next) => {
  try {
    const data = await UserServices.clockEvents(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Clocked Event successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};

/**
  * @param {userId, role} req
  * @param {*} res
  * @returns {data: { present, totalWorking }}
   */
const getAttendance = async (req, res, next) => {
  try {
    const data = await UserServices.getAttendance(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Attendacen Data Sent!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, "Internal Server Error"));
  }
};

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body:{ date, clockIn, clockOut, time }} req
   * @param {*} res
   * @returns {data: {}}
   */
const regularize = async (req, res, next) => {
  try {
    const data = await UserServices.regularize(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Request added successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, error.message));
  }
};
/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data:[{ id, date, clockIn, clockOut, attendanceStatus, status },...]}
   */
const getRegularizedRequests = async (req, res, next) => {
  try {
    const data = await UserServices.getRegularizedRequests(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Requested List sent successfully!", data.data));
    }
  } catch (error) {
    console.log("Error message in userController: ",error.message);
    next(createError(500, "Internal Server Error!"));
  }
};
/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body:{ id, date, clockIn, clockOut, time }} req
   * @param {*} res
   * @returns {data: {}}
   */
const updateRegularize = async (req, res, next) => {
  try {
    const data = await UserServices.updateRegularize(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Request Updated successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, error.message));
  }
};
/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body:{ id }} req
   * @param {*} res
   * @returns {data: {}}
   */
const deleteRegularize = async (req, res, next) => {
  try {
    const data = await UserServices.deleteRegularize(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Request Deleted successfully!", data.data));
    }
  } catch (error) {
    console.log(error.message);
    next(createError(500, error.message));
  }
};




/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {leaveType }} req
   * @param {*} res
   * @returns {data: { availableLeaves }}
   */
const availableLeaves = async (req, res, next) => {
  try {
    const data = await UserServices.availableLeaves(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Available leaves sent successfully!", data.data));
    }
  } catch (error) {
    console.log("Error message in userController: ",error.message);
    next(createError(500, "Internal Server Error!"));
  }
};

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data: { { paid_leave_balance, casual_leave_balance, sick_leave_balance } }}
   */
const getAvailableLeaves = async (req, res, next) => {
  try {
    const data = await UserServices.getAvailableLeaves(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Available leaves sent successfully!", data.data));
    }
  } catch (error) {
    console.log("Error message in userController: ",error.message);
    next(createError(500, "Internal Server Error!"));
  }
};

/**
  * @param {userId, roleId, body: {leaveType, startDate, endDate, appliedLeaves }} req
   * @param {*} res
   * @returns {data: {}}
   */
const applyLeave = async (req, res, next) => {
  try {
    const data = await UserServices.applyLeave(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Leave Applied Successfully!", data.data));
    }
  } catch (error) {
    console.log("Error message in userController: ",error.message);
    next(createError(500, "Internal Server Error!"));
  }
};

/**
  * @param {userId, roleId} req
   * @param {*} res
   * @returns {data: [{ id, leaveType, startDate, endDate, appliedLeaves, status },...]}
   */
const getLeaves = async (req, res, next) => {
  try {
    const data = await UserServices.getLeaves(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Leave Applied Successfully!", data.data));
    }
  } catch (error) {
    console.log("Error message in userController: ",error.message);
    next(createError(500, "Internal Server Error!"));
  }
};

/**
  * @param {userId, roleId, body: {id, leaveType, startDate, endDate, appliedLeaves}} req
   * @param {*} res
   * @returns {data: {}}
   */
const updateLeaves = async (req, res, next) => {
  try {
    const data = await UserServices.updateLeaves(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Leave Request Updated Successfully!", data.data));
    }
  } catch (error) {
    console.log("Error message in userController: ",error.message);
    next(createError(500, "Internal Server Error!"));
  }
}

  /**
  * @param {userId, roleId, body: {id}} req
   * @param {*} res
   * @returns {data: {}}
   */
const deleteLeave = async (req, res, next) => {
  try {
    const data = await UserServices.deleteLeave(req, res);
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      res.status(200).send(sendResponse("Leave Request Deleted Successfully!", data.data));
    }
  } catch (error) {
    console.log("Error message in userController: ",error.message);
    next(createError(500, "Internal Server Error!"));
  }
};

module.exports = {
    getClockStatus,
    getTime,
    clockEvents,
    getAttendance,
    regularize,
    updateRegularize,
    deleteRegularize,
    getRegularizedRequests,
    availableLeaves,
    getAvailableLeaves,
    applyLeave,
    getLeaves,
    updateLeaves,
    deleteLeave
};