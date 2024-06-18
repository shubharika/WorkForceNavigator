const { sendResponse, createError } = require("./baseController.js");
const profileServices = require("../services/profileServices.js");

/**
   * @param {userId, roleId, body:{currentPassword: }} req
   * @param {*} res
   * @returns {data: {name, email, role, designation}}
   */
const getProfile = async (req, res, next) => {
    try {
      const data = await profileServices.getProfile(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Profile Data fetched successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };
  /**
   * @param {userId, roleId, body:{name, email }} req
   * @param {*} res
   * @returns {data: {}}
   */
const updateProfile = async (req, res, next) => {
    try {
      const data = await profileServices.updateProfile(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Profile Data Updated successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };
   /**
   * @param {userId, roleId, body:{currentPassword: }} req
   * @param {*} res
   * @returns {data: {isCorrect: boolean}}
   */
const validatePassword = async (req, res, next) => {
    try {
      const data = await profileServices.validatePassword(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Current Password validated successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };

   /**
   * @param {userId, roleId, body:{newPassword: }} req
   * @param {*} res
   * @returns {data: {}}
   */
   const updatePassword = async (req, res, next) => {
    try {
      const data = await profileServices.updatePassword(req, res);
      if (data.data === null) {
        next(createError(data.status, data.message));
      } else {
        res.status(200).send(sendResponse("Password updated successfully!", data.data));
      }
    } catch (error) {
      console.log(error.message);
      next(createError(500, "Internal Server Error"));
    }
  };

  module.exports = {
    getProfile,
    updateProfile,
    validatePassword,
    updatePassword
  };