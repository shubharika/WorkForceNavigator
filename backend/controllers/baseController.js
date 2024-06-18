/**
 *
 * @param {response message} message
 * @param {response data} data
 * @returns success reponse
 */
const sendResponse = (message, data) => {
  const response = {
    success: true,
    message: message,
    data: data,
  };
  return response;
};

// used to send error from middleware
const sendError = (status, message) => {
  const response = {
    success: false,
    message: message,
    status: status
  };
  return response;
};

// used to send error from controller
// used to send two types of error => 1. 401: Unauthorized 2. 500: Internal Server Error 
const createError = (status, message) => {
  const err = new Error();
  err.status = status;
  err.message = message;
  return err;
}

module.exports = {
  sendResponse,
  sendError,
  createError
};
