const mysql = require("mysql2");
// Setting up the Db connection
const pool = mysql.createPool({
    host:  process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user:  process.env.DB_USER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.DB,
    waitForConnections: true,
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0
  });

pool.getConnection((err, conn) => {
  if(err) {
    console.log("Error connecting Db: ",err)
    console.log(`${JSON.stringify({
    host:  process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user:  process.env.DB_USER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.DB,
    waitForConnections: true,
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0
  })}`)
      
  }else{
    console.log(" Database Connected successfully!", conn.config)
    // Release the connection when done with it.
    conn.release();
  }
})
// now get a Promise wrapped instance of that pool
module.exports = pool.promise();
