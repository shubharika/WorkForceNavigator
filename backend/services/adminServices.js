const { differenceInDays, format } = require("date-fns");
const bycrypt = require("bcrypt");
const saltRounds = 10;
// now get a Promise wrapped instance of that pool
const promisePool = require("./config");

class AdminServices {
  /**
   *
   * @param {userId, role} req
   * @param {*} res
   * @returns {data: [{id ,name, email, designation, date_of_joining, salary},.....]}
   */
  async getEmployees(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    if (roleId === 1) {
      const query = `SELECT id, name, email, designation_id, date_of_joining, salary
        FROM users WHERE role_id = 2 AND status_id = 1;`;
      const [results] = await promisePool.query(query);
      console.log(results);

      const processedResults = await Promise.all(
        results.map(async (row) => {
          const queryDesignation = `SELECT name FROM designation WHERE  id = ? ;`;
          const [resultsDesignation] = await promisePool.query(
            queryDesignation,
            [row?.designation_id]
          );
          const designation =
            resultsDesignation[0]?.name.charAt(0).toUpperCase() +
            resultsDesignation[0]?.name.slice(1);

          return {
            id: row?.id,
            name: row?.name,
            email: row?.email,
            designation,
            dateOfJoining: format(new Date(row?.date_of_joining), "yyyy-MM-dd"),
            salary: row?.salary[row?.salary.length - 1]?.CTC,
          };
        })
      );

      return { data: processedResults };
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }

  /**
   *
   * @param {userId, role} req
   * @param {*} res
   * @returns {data: {availableToday}}
   */
  async availableToday(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    if (roleId === 1) {
      const query = `SELECT COUNT(*) AS employees_active_today FROM (SELECT user_id FROM clock_events WHERE date = CURDATE() AND name="clock-in" GROUP BY user_id) AS active_users;`;
      const [results] = await promisePool.query(query);
      return { data: {availableToday: results[0]?.employees_active_today} };
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }
  /**
   *
   * @param {userId, role, body: {id}} req
   * @param {*} res
   * @returns {data: {name, email, role, status, designation, startDate, salary}}
   */
  async getEmployeeInfo(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { id } = req.body;
    if (roleId === 1) {
      const query = `SELECT name, email, role_id, status_id, designation_id, date_of_joining, salary
      FROM users WHERE id = ?;`;
      const [results] = await promisePool.query(query, [id]);
      const user = results[0];

      const queryRole = `SELECT name FROM roles WHERE id = ? ;`;
      const [resultsRole] = await promisePool.query(queryRole, [user?.role_id]);
      // console.log("Roles: ",resultsRole )
      const role = resultsRole[0]?.name;

      const queryStatus = `SELECT name FROM status WHERE id = ? ;`;
      const [resultsStatus] = await promisePool.query(queryStatus, [
        user?.status_id,
      ]);
      // console.log("Roles: ",resultsRole )
      const status = resultsStatus[0]?.name;

      const queryDesignation = `SELECT name FROM designation WHERE  id = ? ;`;
      const [resultsDesignation] = await promisePool.query(queryDesignation, [
        user?.designation_id,
      ]);
      const designation = resultsDesignation[0]?.name;

      return {
        data: {
          name: user?.name,
          email: user?.email,
          role,
          status,
          designation,
          dateOfJoining: format(new Date(user?.date_of_joining), "yyyy-MM-dd"),
          salary: user?.salary[user?.salary.length - 1]?.CTC,
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
   *
   * @param {userId, role, body: {id, name, email, role, status, designation, dateOfJoining, salary}} req
   * @param {*} res
   * @returns {data: {}}
   */
  async updateEmployeeInfo(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const {
      id,
      name,
      email,
      role,
      status,
      designation,
      dateOfJoining,
      salary,
    } = req.body;
    let role_id, status_id, designation_id, salaryObj;

    if (roleId === 1) {
      const queryRole = `SELECT id FROM roles WHERE name = ? ;`;
      const [resultsRole] = await promisePool.query(queryRole, [role]);
      // console.log("Roles: ",resultsRole )
      role_id = resultsRole[0]?.id;

      const queryStatus = `SELECT id FROM status WHERE name = ? ;`;
      const [resultsStatus] = await promisePool.query(queryStatus, [status]);
      // console.log("Status: ",resultsStatus )
      status_id = resultsStatus[0]?.id;

      const queryDesignation = `SELECT id FROM designation WHERE name = ? ;`;
      const [resultsDesignation] = await promisePool.query(queryDesignation, [
        designation,
      ]);
      // console.log("Designation: ",resultsDesignation )
      designation_id = resultsDesignation[0]?.id;

      const query = `UPDATE  users 
    SET name= ?,
        email=?,
        role_id=?,
        status_id=?,
        designation_id=?,
        date_of_joining=?,
        salary=?,
        updated_by=?,
        updated_at= CURRENT_TIMESTAMP
      WHERE id=?;`;
      // console.log(`${format(new Date(dateOfJoining), "yyyy-MM-dd")} : ${salary}`)

      const [users] = await promisePool.query(query, [
        name,
        email,
        role_id,
        status_id,
        designation_id,
        format(new Date(dateOfJoining), "yyyy-MM-dd"),
        salary,
        userId,
        id,
      ]);

      return { data: {} };
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }

  /**
   *
   * @param {userId, role, body: {id}} req
   * @param {*} res
   * @returns {data: {}}
   */
  async deleteEmployee(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { id } = req.body;

    if (roleId === 1) {
      const query = `DELETE FROM users WHERE id=?;`;
      const [results] = await promisePool.query(query, [id]);

      return { data: {} };
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }

  /**
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data:[{value: , label: }, {value: , label: }]}
   */
  async getRoles(req, res) {
    const roleId = req.roleId;
    if (roleId === 1) {
      const query = `SELECT * FROM roles;`;
      const [results] = await promisePool.query(query);
      //   console.log("Results of getRoles request: ",results);
      const roleOptions = results.map((row) => {
        let label;
        if (row.id === 1) {
          label = "Admin";
        } else {
          label = "Employee";
        }
        return {
          value: row.name,
          label: label,
        };
      });

      return {
        data: roleOptions,
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
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data:[{value: , label: }, {value: , label: }]}
   */
  async getStatus(req, res) {
    const roleId = req.roleId;
    if (roleId === 1) {
      const query = `SELECT * FROM status;`;

      const [results] = await promisePool.query(query);
      console.log("Results of getData request: ", results);
      const statusOptions = results.map((row) => {
        let label;
        if (row.id === 1) {
          label = "Active";
        } else if (row.id === 2) {
          label = "Inactive";
        } else if (row.id === 3) {
          label = "Retired";
        } else if (row.id === 4) {
          label = "Ex-Employee";
        } else if (row.id === 5) {
          label = "Sabbatical";
        }
        return {
          value: row.name,
          label: label,
        };
      });

      return {
        data: statusOptions,
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
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data:[{value: , label: }, {value: , label: }]}
   */
  async getDesignation(req, res) {
    const roleId = req.roleId;
    if (roleId === 1) {
      const query = `SELECT * FROM designation;`;

      const [results] = await promisePool.query(query);
      console.log("Results of getDesignation request: ", results);
      const roleOptions = results.map((row) => {
        let label;
        if (row.id === 1) {
          label = "Intern";
        } else if (row.id === 2) {
          label = "SDE-1";
        } else if (row.id === 3) {
          label = "SDE-2";
        } else if (row.id === 4) {
          label = "Manager";
        } else if (row.id === 5) {
          label = "Data Scientist";
        } else if (row.id === 6) {
          label = "Data Analyst";
        } else if (row.id === 7) {
          label = "Data Engineer";
        } else if (row.id === 8) {
          label = "Human Resources";
        } else if (row.id === 9) {
          label = "Supply Chain Analyst";
        }
        return {
          value: row.name,
          label: label,
        };
      });

      return {
        data: roleOptions,
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
   * @param {userId, role, body:{ name, email, password, dateOfJoining, role,status, designation, salary}} req
   * @param {*} res
   * @returns {data: {}}
   */
  async addEmployee(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const {
      name,
      email,
      password,
      dateOfJoining,
      role,
      status,
      designation,
      salary,
    } = req.body;

    let role_id, status_id, designation_id, paid, casual, sick;

    if (roleId === 1) {
      const hashedPassword = bycrypt.hashSync(password, saltRounds);

      const queryRole = `SELECT id FROM roles WHERE name = ? ;`;
      const [resultsRole] = await promisePool.query(queryRole, [role]);
      // console.log("Roles: ",resultsRole )
      role_id = resultsRole[0]?.id;

      const queryStatus = `SELECT id FROM status WHERE name = ? ;`;
      const [resultsStatus] = await promisePool.query(queryStatus, [status]);
      // console.log("Status: ",resultsStatus )
      status_id = resultsStatus[0]?.id;

      const queryDesignation = `SELECT id FROM designation WHERE name = ? ;`;
      const [resultsDesignation] = await promisePool.query(queryDesignation, [
        designation,
      ]);
      // console.log("Designation: ",resultsDesignation )
      designation_id = resultsDesignation[0]?.id;

      // TODO: company id Hard Coded change it later
      const queryLeaves = `SELECT paid_leave_policy_per_month, casual_leave_policy_per_month , sick_leave_policy_per_month  FROM settings WHERE id = 1 ;`;
      const [resultsLeaves] = await promisePool.query(queryLeaves, [
        designation,
      ]);
      // console.log("Leaves: ",resultsLeaves )
      paid = resultsLeaves[0]?.paid_leave_policy_per_month;
      casual = resultsLeaves[0]?.casual_leave_policy_per_month;
      sick = resultsLeaves[0]?.sick_leave_policy_per_month;

      const query = `INSERT INTO users (name, email, password, role_id, status_id, designation_id, date_of_joining,paid_leave_balance, casual_leave_balance, sick_leave_balance,salary, created_by, updated_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      // console.log(`${format(new Date(dateOfJoining), "yyyy-MM-dd")} : ${salary}`)

      const [users] = await promisePool.query(query, [
        name,
        email,
        hashedPassword,
        role_id,
        status_id,
        designation_id,
        format(new Date(dateOfJoining), "yyyy-MM-dd"),
        paid,
        casual,
        sick,
        salary,
        userId,
        userId,
      ]);

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
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {id}} req
   * @param {*} res
   * @returns {data: [{ id, date, clockIn, clockOut, attendanceStatus, status },...]}
   */
async getRegularizedRequests(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const { id } = req.body; //userId data that we need

  if (roleId === 1) {

    const query = `SELECT * FROM regularize_attendance WHERE user_id = ?`;
    const [results] = await promisePool.query(query, [id]);
    const processedResults = results.map((row) => {
      return { 
        userId: id,  //userId data that we need
        id: row?.id ,// row id 
        date: format(new Date(row?.date),"yyyy-MM-dd"),
        clockIn: row?.clock_in, 
        clockOut: row?.clock_out, 
        attendanceStatus: row?.attendance_status,
        status: row?.status }
    })
    
    return { data: processedResults };
  } else {
    return {
      data: null,
      status: 401,
      message: "Unauthorized",
    };
  }
}
/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {id, userId, date, clockIn, clockOut, status}} req
   * @param {*} res
   * @returns {data: {}}
   * TODO: location is hardCoded 
   */
async updateRegularizedRequest(req, res) {
  const roleId = req.roleId;
  const { id, userId, date, clockIn, clockOut, status } = req.body;

  if (roleId === 1) {

    const query = `UPDATE regularize_attendance SET status=? WHERE user_id = ? AND id = ?`;
    const [results] = await promisePool.query(query, [status, userId, id]);

    if(status === 'approve'){
        const deleteQuery = `DELETE FROM clock_events WHERE user_id=? AND date=?;`
        const [deleteQueryResults] = await promisePool.query(deleteQuery, [userId, format(new Date(date), "yyyy-MM-dd")]);

        const insertQuery = `INSERT INTO clock_events (user_id, name, date, time, location)
                              VALUES (?,?,?,?,?);`
        const [insertQuery1Results] = await promisePool.query(insertQuery, [userId, "clock-in", format(new Date(date), "yyyy-MM-dd"), clockIn, "location"]);
        const [insertQuery2Results] = await promisePool.query(insertQuery, [userId, "clock-out", format(new Date(date), "yyyy-MM-dd"), clockOut, "location"]);
    }
    return { data: {} };
  } else {
    return {
      data: null,
      status: 401,
      message: "Unauthorized",
    };
  }
}

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {userId}}} req
   * @param {*} res
   * @returns {data: [{ userId, id, leaveType, startDate, endDate, appliedLeaves, status },...]}
   */
async getLeaves(req, res) {
  const roleId = req.roleId;
  const { userId } = req.body;

  if (roleId === 1) {

    const query = `SELECT * FROM leave_requests WHERE user_id = ?`;
    const [results] = await promisePool.query(query, [userId]);
    const processedResults = results.map((row) => {
      return { 
        userId,
        id: row?.id,
        leaveType: row?.name, 
        startDate: format(new Date(row?.start_date),"yyyy-MM-dd"), 
        endDate: format(new Date(row?.end_date),"yyyy-MM-dd"), 
        availableLeaves: parseInt(row?.days),
        appliedLeaves: parseInt(row?.days),
        status: row?.status }
    })
    console.log("Processed: ",processedResults)
    return { data:  processedResults};
  } else {
    return {
      data: null,
      status: 401,
      message: "Unauthorized",
    };
  }
}

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body: {userId, id, leaveType, availableLeaves, appliedLeaves, status}}} req
   * @param {*} res
   * @returns {data: {}}
   */
async updateLeave(req, res) {
  const roleId = req.roleId;
  const { userId, id, leaveType, availableLeaves, appliedLeaves, status} = req.body;

  if (roleId === 1) {

    const query = `UPDATE leave_requests 
    SET status = ? WHERE id = ? AND user_id = ?`;
    const [results] = await promisePool.query(query, [status, id, userId ]);

    if(status === 'approve'){
      let updateQuery;
      if(leaveType === 'paid'){
        updateQuery = `UPDATE users SET paid_leave_balance= ? WHERE id=? ;`
      }else if(leaveType === 'casual'){
        updateQuery = `UPDATE users SET casual_leave_balance= ? WHERE id=? ;`
      }else if(leaveType === 'sick'){
        updateQuery = `UPDATE users SET sick_leave_balance= ? WHERE id=? ;`
      }else{
        return { data:  {}}
      }
      const updateLeavesLeft = parseInt(availableLeaves) - parseInt(appliedLeaves)
      const [updateQueryResults] = await promisePool.query(updateQuery, [updateLeavesLeft, userId ]);
    }
  
    return { data:  {}};
  } else {
    return {
      data: null,
      status: 401,
      message: "Unauthorized",
    };
  }
}

  /**
   * @param {userId, role} req
   * @param {*} res
   * @returns {data:{name, wrk_hrs, paid_policy, casual_policy, sick_policy, salary_cycle}}
   */
  async getSettings(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    if (roleId === 1) {
      const query = `SELECT * FROM settings;`;
      const [results] = await promisePool.query(query);
      // console.log("Results of getData request: ",results[0]);

      return {
        data: {
          name: results[0].company_name,
          wrk_hrs: results[0].working_hours_per_day,
          paid_policy: results[0].paid_leave_policy_per_month,
          casual_policy: results[0].casual_leave_policy_per_month,
          sick_policy: results[0].sick_leave_policy_per_month,
          salary_cycle: results[0].salary_cycle,
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
   * @param {userId, role, body:{workingHours, paidLeavePolicy, casualLeavePolicy, sickLeavePolicy, salaryCycle,} } req
   * @param {*} res
   * @returns {data:{}}
   */
  async updateSettings(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const {
      workingHours,
      paidLeavePolicy,
      casualLeavePolicy,
      sickLeavePolicy,
      salaryCycle,
    } = req.body;
    console.log(req.body);

    if (roleId === 1) {
      const query = `UPDATE settings
      SET working_hours_per_day = ?,
          paid_leave_policy_per_month = ?,
          casual_leave_policy_per_month = ?,
          sick_leave_policy_per_month = ?,
          salary_cycle = ?,
          updated_by = ?,
          updated_at = CURRENT_TIMESTAMP;`;

      const [results] = await promisePool.query(query, [
        workingHours,
        paidLeavePolicy,
        casualLeavePolicy,
        sickLeavePolicy,
        salaryCycle,
        userId,
      ]);

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
   * get all the attendacne for a particular user for a date range
   * @param {userId, role, body:{ id, start, end }} req
   * @param {*} res
   * @returns {data: [{date, hrs, status},{date, hrs, status},...]}
   */
  async getAttendance(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { id, start, end } = req.body;

    if (roleId === 1) {
      console.log(start);

      const query = `SELECT
        work_date,
        SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, clock_in_time, clock_out_time))) AS total_hours,
        IF(SUM(TIMESTAMPDIFF(SECOND, clock_in_time, clock_out_time)) >= 28800, 'present', 'absent') AS attendance_status
      FROM (
        SELECT
          DATE(ce_in.date) AS work_date,
          CONCAT(ce_in.date, ' ', ce_in.time) AS clock_in_time,
          (
            SELECT MIN(CONCAT(ce_out.date, ' ', ce_out.time))
            FROM clock_events AS ce_out
            WHERE ce_out.name = 'clock-out'
              AND ce_out.user_id = ?
              AND DATE(ce_out.date) = DATE(ce_in.date)
              AND CONCAT(ce_out.date, ' ', ce_out.time) > CONCAT(ce_in.date, ' ', ce_in.time)
            ORDER BY CONCAT(ce_out.date, ' ', ce_out.time)
            LIMIT 1
          ) AS clock_out_time
        FROM clock_events AS ce_in
        WHERE ce_in.name = 'clock-in'
          AND ce_in.user_id = ?
          AND DATE(ce_in.date) >= ?
          AND DATE(ce_in.date) <= ?
      ) AS time_diff
      GROUP BY work_date`;
      const [results] = await promisePool.query(query, [id, id, start, end]);
      // console.log(results); //[{date, hrs, status},{date, hrs, status},...]
      return { data: results };
    } else {
      return {
        data: null,
        status: 401,
        message: "Unauthorized",
      };
    }
  }

  /**
   * get all the attendacne for a particular user for a date range
   * @param {userId, role, body:{ id, month_year }} req
   * @param {*} res
   * @returns {data: {pay_period_start,pay_period_end,no_of_days,basic_pay_per_month,house_rent_allowance,travel_allowance_per_month,medical_allowance_per_month,incentives_per_month,special_allowance_per_month,gross_salary,employer_provident_fund,company_insurance,employee_provident_fund,tax, net,payment_date,}}
   */

  // TODO: change Payment_Date: hard_Coded currently
  async calculateSalary(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { id, month_year } = req.body;
    // console.log("employeee Id: ",id );
    const [month, year] = month_year.split("-");
    // Gross = monthly_ctc - Employers_contribution on behalf of employee
    // Employers_contribution = employer's provident fund + company insurance + Employee's contribution to provident fund
    // net_salary = gross - tax
    let start, end, salary_object;
    let ctc,
      gross_salary,
      basic_salary,
      hra,
      travel,
      medical,
      incentive,
      special,
      tax_deduction_percent,
      net_salary;
    let unpaid_leaves = 0,
      total_working_days,
      deducted_amt = 0;

    if (roleId === 1) {
      // Calculate start date and end date
      const [settings] = await promisePool.query(
        "SELECT salary_cycle FROM settings WHERE id = ?",
        [1]
      );
      const salaryCycle = settings[0].salary_cycle;

      // Calculate the current month start date
      const currentMonthStart = new Date(`${year}-${month}-01`);
      start = new Date(currentMonthStart);
      start.setDate(start.getDate() + salaryCycle);

      end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      // Calculate current period salary
      total_working_days = differenceInDays(end, start);
      console.log("Total: ", total_working_days);

      const formattedStartDate = format(start, "yyyy-MM-dd");
      const formattedEndDate = format(end, "yyyy-MM-dd");

      // console.log(start);
      // console.log(end);

      // console.log(formattedStartDate);
      // console.log(formattedEndDate);
      // Check if already calculated or not in salary table
      const checkQuery =
        "SELECT * FROM salaries WHERE user_id = ? AND pay_period_start = ? AND pay_period_end = ?;";
      const [results] = await promisePool.query(checkQuery, [
        id,
        formattedStartDate,
        formattedEndDate,
      ]);
      if (results.length === 0) {
        // get CTC from users table
        const query1 = "SELECT salary FROM users WHERE id = ?;";
        const [annual_salary] = await promisePool.query(query1, [id]);
        salary_object =
          annual_salary[0]["salary"][annual_salary[0]["salary"].length - 1];
        ctc = salary_object["CTC"];
        gross_salary =
          (ctc -
            salary_object["pf_employer_contribution"] -
            salary_object["company_insurance"] -
            salary_object["pf_employee_contribution"]) /
          12;
        // Calculate Breakage
        // Basic salary_object["company_insurance"]/12
        basic_salary = salary_object["Basic"] / 12;
        // HRA
        hra = salary_object["hra"] / 12;
        // Travel
        travel = salary_object["travel"] / 12;
        // Medical
        medical = salary_object["medical"] / 12;
        // Incentive
        incentive = salary_object["incentive"] / 12;
        // Special
        special = salary_object["special"] / 12;
        //Calculate unpaid leaves
        const query2 = "SELECT* FROM leave_requests WHERE user_id = ?;";
        const [leaves] = await promisePool.query(query2, [id]);
        if (
          leaves[0]?.name === "unpaid_leave" &&
          leaves[0]?.status === "approved"
        ) {
          unpaid_leaves = leaves[0]["days"];
        }

        if (unpaid_leaves !== 0) {
          // console.log("End: ", end);
          // console.log("Start: ", start);
          // Calculate PAID working days
          const paid_days = total_working_days - unpaid_leaves;
          const current_period_salary =
            (gross_salary * paid_days) / total_working_days;
          // console.log("ideally: ",salary_after_fixed_deductions);
          // console.log("current: ",current_period_salary);

          // Calculate tax deduction for the current period
          deducted_amt = gross_salary - current_period_salary;
          ctc -= deducted_amt;

          gross_salary = (gross_salary * paid_days) / total_working_days;
          // Basic
          basic_salary = (basic_salary * paid_days) / total_working_days;
          // HRA
          hra = (hra * paid_days) / total_working_days;
          // Travel
          travel = (travel * paid_days) / total_working_days;
          // Medical
          medical = (medical * paid_days) / total_working_days;
          // Incentive
          incentive = (incentive * paid_days) / total_working_days;
          // Special
          special = (special * paid_days) / total_working_days;
        }

        // Check tax slab
        if (ctc <= 600000) {
          tax_deduction_percent = 0;
        } else if (600000 < ctc <= 900000) {
          tax_deduction_percent = 0.05;
        } else if (900000 < ctc <= 1500000) {
          tax_deduction_percent = 0.1;
        } else if (1500000 < ctc <= 2500000) {
          tax_deduction_percent = 0.15;
        } else if (2500000 < ctc <= 3500000) {
          tax_deduction_percent = 0.2;
        } else if (3500000 < ctc) {
          tax_deduction_percent = 0.3;
        }

        const tax_deduction = (ctc * tax_deduction_percent) / 12;
        net_salary = gross_salary - tax_deduction;

        // Before Sending the response add this into the salaries db as well
        // after breaking the gross_salary into subparts
        const insertQuery = `INSERT INTO salaries (user_id, pay_period_start, 
        pay_period_end, no_of_days, basic_pay_per_month, hra, 
        travel_allowance_per_month, medical_allowance_per_month,
        incentives_per_month, special_allowance_per_month,
        gross_salary, employer_provident_fund,company_insurance, 
        employee_provident_fund, tax_deductions, net_salary, 
        payment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?,?,?,? ,'2023-06-28');`;

        const [insert] = await promisePool.query(insertQuery, [
          id,
          formattedStartDate,
          formattedEndDate,
          total_working_days,
          basic_salary,
          hra,
          travel,
          medical,
          incentive,
          special,
          gross_salary,
          salary_object["pf_employer_contribution"] / 12,
          salary_object["company_insurance"] / 12,
          salary_object["pf_employee_contribution"] / 12,
          tax_deduction,
          net_salary,
        ]);

        return {
          data: {
            pay_period_start: start,
            pay_period_end: end,
            no_of_days: total_working_days,
            basic_pay_per_month: basic_salary,
            house_rent_allowance: hra,
            travel_allowance_per_month: travel,
            medical_allowance_per_month: medical,
            incentives_per_month: incentive,
            special_allowance_per_month: special,
            gross_salary: gross_salary,
            employer_provident_fund:
              salary_object["pf_employer_contribution"] / 12,
            company_insurance: salary_object["company_insurance"] / 12,
            employee_provident_fund:
              salary_object["pf_employee_contribution"] / 12,
            tax: tax_deduction,
            net: net_salary,
            payment_date: "2023-06-28",
          },
        };
      } else {
        // Directly fetch from salaries db
        return {
          data: {
            pay_period_start: results[0].pay_period_start,
            pay_period_end: results[0].pay_period_end,
            no_of_days: results[0].no_of_days,
            basic_pay_per_month: results[0].basic_pay_per_month,
            house_rent_allowance: results[0].hra,
            travel_allowance_per_month: results[0].travel_allowance_per_month,
            medical_allowance_per_month: results[0].medical_allowance_per_month,
            incentives_per_month: results[0].incentives_per_month,
            special_allowance_per_month: results[0].special_allowance_per_month,
            gross_salary: results[0].gross_salary,
            employer_provident_fund: results[0].employer_provident_fund,
            company_insurance: results[0].company_insurance,
            employee_provident_fund: results[0].employee_provident_fund,
            tax: results[0].tax_deductions,
            net: results[0].net_salary,
            payment_date: results[0].payment_date,
          },
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

module.exports = new AdminServices();

// password123 = $2b$10$pSF83gDb5kECUo5IthjFvuxET2V1sxO033sf3syqSl0KHqqT5NSsu
// password456 = $2b$10$26wEHHy9R5CnnvkTP0XtguZ8sdRXP3ePuEt2YANY6sMwziZHx5LES
// Anmol#123 = $2b$10$ZgiUOwe7aeRFGJxuTckmoeS3f2HrISQFnVVy6J/pSaiywtMnOIRzi
