const { sendResponse, createError } = require("./baseController.js");
const AuthServices = require("../services/authServices.js");

/** Gets all the information for the Dashboard page for both user and admin
 * @param {email, password} req
 * @return {success: true, message, data:{accessToken: token}} or {success: false, message, status}
 */
const userLogin = async (req, res, next) => {
    try {
      const data = await AuthServices.login(req, res);  // data = {data: {accessToken: token}} |  {data: null, status: 401,message: "Invalid Username or Password"}
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        console.log("Message in authController.js: Logged In Successfully!")
        res.status(200).send(sendResponse("Logged In Successfully!", data.data)); // data.data = { accessToken: token }
      }
    } catch (error) {
      console.log("Error in authController.js: ",error);
      next(createError(500, "Internal Server Error!"));
    }
  };
  /** Gets all the information for the Dashboard page for both user and admin
 * @param {idToken} req
 * @return {success: true, message, data:{accessToken: token}} or {success: false, message, status}
 */
const googleLogin = async (req, res, next) => {
  try {
    const data = await AuthServices.loginGoogle(req, res);  // data = {data: {accessToken: token}} |  {data: null, status: 401,message: "Invalid Username or Password"}
    if (data.data === null) {
      next(createError(data.status, data.message));
    } else {
      console.log("Message in authController.js: Logged In Successfully!")
      res.status(200).send(sendResponse("Logged In Successfully!", data.data)); // data.data = { accessToken: token }
    }
  } catch (error) {
    console.log("Error in authController.js: ",error);
    next(createError(500, "Internal Server Error!"));
  }
};

/**
 * userLogout : It logs out the user 
 * @param {JWT token in header} req 
 * @param {success message} res 
 * @returns message
 */
const userLogout = async (req, res, next) => {
    try {
        const data = await AuthServices.logout(req, res); // data = "User logged out successfully!"
        console.log("Message in authController.js: Logged Out Successfully!")
        res.status(200).send(sendResponse("Logged out", data));

    } catch (err) {
        console.log("Error in authController.js: ",error);
        next(createError(500, err?.message));
    }
};

module.exports = { userLogin, googleLogin, userLogout};