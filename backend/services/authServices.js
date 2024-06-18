require('dotenv').config()
const jwt = require("jsonwebtoken");
const bycrypt = require("bcrypt")
const saltRounds = 10;
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// now get a Promise wrapped instance of that pool
const promisePool = require("./config");

class AuthServices {
  /**
   * @param {email, password} req
   * @returns {data:{accessToken: token}}
   */
  async login(req, res) {
    const { email, password } = req.body;
    console.log("Email received from user: ", email);
    console.log("Password received from user: ", password);
    const userExistsQuery = "SELECT * FROM users WHERE email = ?";
    const [results] = await promisePool.query(userExistsQuery, [email]);
    const user = results[0];
    // console.log("User Entered password: ", password)
    // console.log("Hashed password in Db: ", user?.password)
    
    if(typeof user?.password !=='undefined'){
      if (bycrypt.compareSync(password, user?.password)) {
        // password verfied successfully
        // If the password is the same, return back 200 status code to the client
        // Also send back a token (any random string will do for now)
        // Base64 variant of your payload with certain security embedded.
        // Payload in between the two dots
        const profile = `SELECT picture FROM federated_credentials WHERE user_id=?;`
        const [resultsProfile] = await promisePool.query(profile, [user.id]);
        console.log(resultsProfile)
    
        const token = jwt.sign(
            {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.role_id, 
            statusId: user.status_id,
            profile: resultsProfile[0]?.picture
            },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );
        // console.log("Sent token: ", token);
        return {
            data: {
            accessToken: token,
            },
        };
        } 
        return {
          data: null,
          status: 401,
          message: "Invalid Username or Password",
      };
    }else{
      return {
        data: null,
        status: 401,
        message: "Invalid Username or Password",
    };
    }

    
  }

  /**
   * @param {idToken} req
   * @returns {data:{accessToken: token}}
   */
  async loginGoogle(req, res) {
    const { idToken } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    console.log("Ticket after verifying token: ",ticket);

    // const payload = jwt.decode(idToken);
    const payload = ticket.getPayload();
    let user;

    const query = 'SELECT user_id FROM federated_credentials WHERE sub=? ;'
    const [resultsQuery] = await promisePool.query(query, [payload.sub]);

    if(resultsQuery.length !== 0){
      const userId = resultsQuery[0]?.user_id;
      const userExistsQuery = "SELECT * FROM users WHERE id = ?";
      const [results] = await promisePool.query(userExistsQuery, [userId]);
      user = results[0];
    }else{
      const userQuery = "SELECT * FROM users WHERE email = ?";
      const [results] = await promisePool.query(userQuery, [payload.email]);
      console.log("Query Results: ", results)
      if(results.length !== 0){
        user = results[0];
        const insertQuery = `INSERT INTO federated_credentials (user_id, provider, sub, email, name, picture)
                          VALUES (?,"google",?,?,?,?);`
        const [resultsInsertQuery] = await promisePool.query(insertQuery, [user.id, payload.sub, payload.email, payload.name, payload.picture ]);
      }else{
        return {
          data: null,
          status: 401,
          message: "Invalid Username or Password",
      };
      }
    }
    const token = jwt.sign(
      {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.role_id, 
      statusId: user.status_id,
      profile: payload.picture
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
  );
  // console.log("Sent token: ", token);
  return {
      data: {
      accessToken: token,
      },
  };
 
  }

  async logout(req, res) {
    var token = req.headers.authorization.split(' ')[1];
    revokedTokens.add(token);
    var data = "User logged out successfully!"
    return data;
}

}

module.exports = new AuthServices();
