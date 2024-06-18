const { differenceInDays, format } = require("date-fns");
const bycrypt = require("bcrypt");
const saltRounds = 10;

// now get a Promise wrapped instance of that pool
const promisePool = require("./config");

class ProfileServices {
  /**
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data: {name, email, role, designation}}
   */
  async getProfile(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    let role, designation;

    if (roleId === 1 || roleId === 2) {
      const query = `SELECT name, email, role_id, designation_id FROM users WHERE id = ?;`;
      const [results] = await promisePool.query(query, [userId]);
      console.log("Result of getProfile query: ", results);
      const user = results[0];

      const queryRole = `SELECT name FROM roles WHERE  id = ? ;`;
      const [resultsRole] = await promisePool.query(queryRole, [user?.role_id]);
      // console.log("Roles: ",resultsRole )
      role =
        resultsRole[0]?.name.charAt(0).toUpperCase() +
        resultsRole[0]?.name.slice(1);

      const queryDesignation = `SELECT name FROM designation WHERE  id = ? ;`;
      const [resultsDesignation] = await promisePool.query(queryDesignation, [
        user?.designation_id,
      ]);
      designation =
        resultsDesignation[0]?.name.charAt(0).toUpperCase() +
        resultsDesignation[0]?.name.slice(1);

      return {
        data: {
          name: user?.name,
          email: user?.email,
          role,
          designation,
        },
      };
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }

  /**
   * @param {userId, roleId, body:{name, email }} req
   * @param {*} res
   * @returns {data: {}}
   */
  async updateProfile(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { name, email } = req.body;

    if (roleId === 1 || roleId === 2) {
      // update in users table
      const query = `UPDATE users SET name = ?, email = ? WHERE id = ?;`;
      const [results] = await promisePool.query(query, [name, email, userId]);
      // update in federated_credentials table
      const query2 = `SELECT email FROM federated_credentials WHERE user_id=?`;
      const [results2] = await promisePool.query(query2, [userId]);
      if(results2.length === 0){
        console.log("social login of this employee NOT available!")
      }else{
        if(results2[0]?.email === email){
          const query3 = `UPDATE federated_credentials SET name = ? WHERE user_id = ?;`;
          const [results3] = await promisePool.query(query3, [name, userId]);
        }else{
          // email changed and hence delete the record from the table
          const query4 = `DELETE FROM federated_credentials WHERE user_id = ?;`;
          const [results4] = await promisePool.query(query4, [userId]);
        }
      }
      return {
        data: {},
      };
     
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }

  /**
   * @param {userId, roleId, body:{currentPassword: }} req
   * @param {*} res
   * @returns {data: {isCorrect: boolean}}
   */
  async validatePassword(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { currentPassword } = req.body;

    if (roleId === 1 || roleId === 2) {
      const query = `SELECT password FROM users WHERE id = ?;`;
      const [results] = await promisePool.query(query, [userId]);
      console.log("Result of validatepassword query: ", results);
      const user = results[0];

      return {
        data: {
          isCorrect: bycrypt.compareSync(currentPassword, user?.password),
        },
      };
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }

  /**
   * Update the password as well change the status from inactive to active
   * @param {userId, roleId, body:{newPassword: }} req
   * @param {*} res
   * @returns {data:{}}
   */
  async updatePassword(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { newPassword } = req.body;

    if (roleId === 1 || roleId === 2) {
      const oldPasswordQuery = `SELECT password FROM users WHERE id = ?;`;
      const [results] = await promisePool.query(oldPasswordQuery, [userId]);
      const user = results[0];

      if (!bycrypt.compareSync(newPassword, user?.password)) {
        const newHashedPassword = bycrypt.hashSync(newPassword, saltRounds);
        const query = `UPDATE users SET password = ?, status_id = 1 WHERE id = ?;`;

        const [results] = await promisePool.query(query, [
          newHashedPassword,
          userId,
        ]);
        console.log("Password Updated Successfully!");
        return {
          data: {},
        };
      } else {
        return {
          data: null,
          status: 400,
          message: "New Password can't be same as the current password!",
        };
      }
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }
}

module.exports = new ProfileServices();
