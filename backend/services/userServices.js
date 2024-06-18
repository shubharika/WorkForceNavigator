const { differenceInDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } = require("date-fns");
// now get a Promise wrapped instance of that pool
const promisePool = require("./config");

class UserServices {

    /**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data: {clockStatus}}
   */
  async getClockStatus(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;


    if (roleId === 2) {
      const query = `SELECT name FROM clock_events WHERE user_id = ? AND date = CURDATE();`;
      const [results] = await promisePool.query(query, [userId]);
      let clockStatus;
      if(results.length === 0){
        clockStatus="clock-out"
      }else{
        clockStatus = results[results.length - 1]?.name
      }

      return { data: {clockStatus} };
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
   * @returns {data: { entryTime, totalSeconds }}
   */
  async getTime(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;

    if (roleId === 2) {
      // Check for Number of clock-ins
      const checkMultipleClockInsQuery =
        "SELECT COUNT(*) AS numClockIns FROM clock_events WHERE user_id = ? AND name = ? AND date = CURDATE()";
      const [outputs] = await promisePool.query(checkMultipleClockInsQuery, [userId, "clock-in",]);
      const numClockIns = outputs[0].numClockIns;
      console.log("Numclock: ", numClockIns)

      // Check for Number of clock-Outs
      const checkMultipleClockOutsQuery =
        "SELECT COUNT(*) AS numClockOuts FROM clock_events WHERE user_id = ? AND name = ? AND date = CURDATE()";
      const [outputsOut] = await promisePool.query(checkMultipleClockOutsQuery, [userId, "clock-out"]);
      const numClockOuts = outputsOut[0].numClockOuts;


      const selectQuery = `SELECT user_id, date, SUM(time_difference.time_difference_seconds) AS total_seconds
      FROM
        (SELECT 
      clock_in.user_id,
      clock_in.date, 
        clock_in.time AS clock_in_time, 
        clock_out.time AS clock_out_time,
        TIMESTAMPDIFF(SECOND, clock_in.time, clock_out.time) AS time_difference_seconds
      FROM 
        (SELECT user_id, date, ROW_NUMBER() OVER (ORDER BY time) AS row_num, time 
            FROM clock_events
            WHERE name = 'clock-in'
            AND user_id = ?
            AND date = CURDATE()) AS clock_in
      INNER JOIN
        (SELECT date, ROW_NUMBER() OVER (ORDER BY time) AS row_num, time 
            FROM clock_events
            WHERE name = 'clock-out'
            AND user_id = ?
            AND date = CURDATE()) AS clock_out
      ON clock_in.row_num = clock_out.row_num) AS time_difference
        GROUP BY date;`;

      if (numClockIns === 0) {
        console.log("Inside 0")
        return {
          data: {
            entryTime: null,
            totalSeconds: 0,
          },
        };
      } else if (numClockIns === numClockOuts) {
        
        const [results] = await promisePool.query(selectQuery, [userId, userId]);
        console.log("Results of Selected Query: ", results);

        return {
            data: {
              entryTime: null,
              totalSeconds: results[0]?.total_seconds,
            },
          };
      } else {
        // Case: numClockIns > numClockOuts
        const [results] = await promisePool.query(selectQuery, [userId, userId]);
        console.log("Results of Selected Query: ", results);

        const entryTimeQuery = `SELECT date, time 
                                    FROM clock_events
                                    WHERE name = 'clock-in'
                                    AND user_id = ? 
                                    AND date = CURDATE();`;
        const [entryResults] = await promisePool.query(entryTimeQuery, [userId]);
        console.log("Results of Entry Time Query: ", entryResults[entryResults.length - 1]?.time);

        return {
            data: {
              entryTime: entryResults[entryResults.length - 1]?.time,
              totalSeconds: results[0]?.total_seconds || 0,
            },
          };
      }
    } else {
      return {
        data: null,
        status: 401,
        message: "Bad Request: Role NOT valid",
      };
    }
  }

  /**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body:{ clockStatus }} req
   * @param {*} res
   * @returns {data: {}}
   * TODO: location is hard coded...retrieve it from req ip address
   */
  async clockEvents(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;
    const { clockStatus } = req.body;
    let location;

    if (roleId === 2) {
      const query = `INSERT INTO clock_events (user_id, name, date, time, location) 
        VALUES (?,?,CURDATE(),CURTIME(),"Location");`;
      const [results] = await promisePool.query(query, [userId, clockStatus]);
      
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
   * @returns {data: { entryTime, totalSeconds }}
   */
  async getAttendance(req, res) {
    const userId = req.userId;
    const roleId = req.roleId;

    if (roleId === 2) {
      // Get the current date
      const currentDate = new Date();
      
      // Calculate the start and end of the current month
      const startOfMonthDate = startOfMonth(currentDate);
      const endOfMonthDate = endOfMonth(currentDate);
      
      // Generate an array of all days in the current month
      const allDaysInMonth = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate });
      
      // Calculate working days (excluding weekends)
      const workingDays = allDaysInMonth.filter(day => !isWeekend(day));
      console.log("Start Date: ", format(startOfMonthDate, "yyyy-MM-dd"));
      console.log("End Date: ", format(endOfMonthDate, "yyyy-MM-dd"));
      console.log("Working Days: ", workingDays.length );

      const hoursQuery = `SELECT working_hours_per_day FROM settings;`
      const [resultHoursQuery] = await promisePool.query(hoursQuery);
      const hours = parseInt(resultHoursQuery[0]?.working_hours_per_day)
      const seconds = hours * 3600;

      const query = `SELECT COUNT(*) AS present 
      FROM(SELECT 
        user_id, 
          date, 
          SUM(time_difference.time_difference_seconds) AS total_seconds,
          IF(SUM(time_difference.time_difference_seconds) >= ?, 'present', 'absent') AS attendance_status
            FROM
              (SELECT 
            clock_in.user_id,
            clock_in.date, 
              clock_in.time AS clock_in_time, 
              clock_out.time AS clock_out_time,
              TIMESTAMPDIFF(SECOND, clock_in.time, clock_out.time) AS time_difference_seconds
            FROM 
              (SELECT ROW_NUMBER() OVER (ORDER BY date) AS row_num, user_id, date, time 
                  FROM clock_events
                  WHERE name = 'clock-in'
                  AND user_id = ?
                  AND date <= ?
                  AND date >= ?) AS clock_in
            INNER JOIN
              (SELECT  ROW_NUMBER() OVER (ORDER BY date) AS row_num, date, time 
            FROM clock_events
            WHERE name = 'clock-out'
            AND user_id = ?
            AND date <= ?
            AND date >= ?) AS clock_out
            ON clock_in.row_num = clock_out.row_num AND clock_in.date = clock_out.date) AS time_difference
        GROUP BY date) AS attendance
        WHERE attendance_status='present'`;
        const [results] = await promisePool.query(query, [seconds, userId, format(endOfMonthDate, "yyyy-MM-dd"), format(startOfMonthDate, "yyyy-MM-dd"), userId, format(endOfMonthDate, "yyyy-MM-dd"), format(startOfMonthDate, "yyyy-MM-dd")]);
        console.log("Results of getAttendance query: ", results)
        

        return {
          data: {
            present: results[0]?.present,
            totalWorking: workingDays.length ,
          },
        }
    } else {
      return {
        data: null,
        status: 401,
        message: "Bad Request: Role NOT valid",
      };
    }
  }

/**
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, body:{ date, clockIn, clockOut, time }} req
   * @param {*} res
   * @returns {data: {}}
   */
async regularize(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const { date, clockIn, clockOut, time } = req.body;

  if (roleId === 2) {

    const hoursQuery = `SELECT working_hours_per_day FROM settings;`
    const [resultHoursQuery] = await promisePool.query(hoursQuery);
    const hours = parseInt(resultHoursQuery[0]?.working_hours_per_day)

    const attendanceStatus = parseInt(time)>=hours ? "present" : "absent";
    const query = `INSERT INTO regularize_attendance (user_id, date, clock_in, clock_out, attendance_status, status) 
      VALUES (?, ?, ?, ?, ?, ?);`;
    const [results] = await promisePool.query(query, [userId, format(new Date(date), "yyyy-MM-dd"), clockIn, clockOut, attendanceStatus, "pending" ]);
    
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
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data: [{ id, date, clockIn, clockOut, attendanceStatus, status },...]}
   */
async getRegularizedRequests(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;

  if (roleId === 2) {

    const query = `SELECT * FROM regularize_attendance WHERE user_id = ?`;
    const [results] = await promisePool.query(query, [userId]);
    const processedResults = results.map((row) => {
      return { 
        id: row?.id ,
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
   * @param {userId, roleId, body:{ id, date, clockIn, clockOut, time }} req
   * @param {*} res
   * @returns {data: {}}
   */
async updateRegularize(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const { id, date, clockIn, clockOut, time } = req.body;

  if (roleId === 2) {
    const attendanceStatus = parseInt(time)>=8 ? "present" : "absent";
    const query = `UPDATE regularize_attendance
    SET 
        clock_in = ?,
        clock_out = ?,
        attendance_status = ?,
        status = ?
    WHERE user_id = ? AND id=?`;
    const [results] = await promisePool.query(query, [  clockIn, clockOut, attendanceStatus, "pending", userId, id ]);
    
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
   * @param {userId, roleId, body:{ id }} req
   * @param {*} res
   * @returns {data: {}}
   */
async deleteRegularize(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const { id } = req.body;

  if (roleId === 2) {
    const query = `DELETE FROM regularize_attendance WHERE user_id = ? AND id=?`;
    const [results] = await promisePool.query(query, [  userId, id ]);
    
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
   * @param {userId, roleId, body: {leaveType}} req
   * @param {*} res
   * @returns {data: { availableLeaves }}
   */
async availableLeaves(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const { leaveType } = req.body;


  if (roleId === 2) {

    const query = `SELECT paid_leave_balance, casual_leave_balance, sick_leave_balance FROM users WHERE id = ?`;
    const [results] = await promisePool.query(query, [userId]);
    let availableLeaves;
    
    if(leaveType === 'paid'){
      availableLeaves = results[0]?.paid_leave_balance;
    }else if(leaveType === 'casual'){
      availableLeaves = results[0]?.casual_leave_balance;
    }else if(leaveType === 'sick'){
      availableLeaves = results[0]?.sick_leave_balance;
    }else{
      availableLeaves = 30
    }
    return { data: {
      availableLeaves
    } };
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
   * @param {userId, roleId} req
   * @param {*} res
   * @returns {data: { paid_leave_balance, casual_leave_balance, sick_leave_balance }}
   */
async getAvailableLeaves(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;



  if (roleId === 2) {

    const query = `SELECT paid_leave_balance, casual_leave_balance, sick_leave_balance FROM users WHERE id = ?`;
    const [results] = await promisePool.query(query, [userId]);
    return { data: results[0]};

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
   * @param {userId, roleId, body: {leaveType, startDate, endDate, appliedLeaves }} req
   * @param {*} res
   * @returns {data: {  }}
   */
async applyLeave(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const { leaveType, startDate, endDate, appliedLeaves } = req.body;

  console.log(req.body);
  if (roleId === 2) {

    const query = `INSERT INTO leave_requests (user_id, name, start_date, end_date, days, status) 
                    VALUES (?,?,?,?,?,?)`;
    const [results] = await promisePool.query(query, [userId, leaveType, format(new Date(startDate),"yyyy-MM-dd"), format(new Date(endDate),"yyyy-MM-dd"), parseInt(appliedLeaves), "pending" ]);
  
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
   * @param {userId, roleId}} req
   * @param {*} res
   * @returns {data: [{ id, leaveType, startDate, endDate, appliedLeaves, status },...]}
   */
async getLeaves(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  if (roleId === 2) {

    const query = `SELECT * FROM leave_requests WHERE user_id = ?`;
    const [results] = await promisePool.query(query, [userId ]);
    const processedResults = results.map((row) => {
      return { 
        id: row?.id,
        leaveType: row?.name, 
        startDate: format(new Date(row?.start_date),"yyyy-MM-dd"), 
        endDate: format(new Date(row?.end_date),"yyyy-MM-dd"), 
        availableLeaves: parseInt(row?.days),
        appliedLeaves: parseInt(row?.days),
        status: row?.status }
    })
  
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
   * @param {userId, roleId, , body: {id, leaveType, startDate, endDate, appliedLeaves}}} req
   * @param {*} res
   * @returns {data: {}}
   */
async updateLeaves(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const {id, leaveType, startDate, endDate, appliedLeaves} = req.body

  if (roleId === 2) {

    const query = `UPDATE leave_requests 
    SET 
      name = ?,
      start_date=?,
      end_date = ?,
      days = ?
    WHERE id = ? AND user_id = ?`;
    const [results] = await promisePool.query(query, [leaveType, format(new Date(startDate),"yyyy-MM-dd"),format(new Date(endDate),"yyyy-MM-dd") , appliedLeaves, id, userId ]);
  
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
   * get all the attendacne for a particular user for a date range
   * @param {userId, roleId, , body: {id}}} req
   * @param {*} res
   * @returns {data: {}}
   */
async deleteLeave(req, res) {
  const userId = req.userId;
  const roleId = req.roleId;
  const { id } = req.body;

  if (roleId === 2) {

    const query = `DELETE FROM leave_requests WHERE id = ? AND user_id = ?`;
    const [results] = await promisePool.query(query, [id, userId ]);
  
    return { data:  {}};
  } else {
    return {
      data: null,
      status: 401,
      message: "Unauthorized",
    };
  }
}

}

module.exports = new UserServices();
