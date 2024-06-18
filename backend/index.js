require('dotenv').config()
// console.log(process.env)
// console.log(process.env.SECRET_KEY)
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth.js");
const admin = require("./routes/admin.js");
const profile = require("./routes/profile.js");
const user = require("./routes/user.js");



global.revokedTokens = new Set();
const app = express();

// ADD MIDDLEWARES 

// When you use app.use(cors()), it adds the CORS middleware to
// your Express application's middleware stack. This middleware
// adds the necessary HTTP headers to the server's responses
// to allow cross-origin requests from web browsers. It sets
// headers such as Access-Control-Allow-Origin to specify which
// origins are allowed to access the server's resources.
// CORS - Cross Origin Resource Sharing, our Frontend will be runing on different port (3000) and our Backend will run of 5000, it so how can frontend access backend, so we need to connect it, thats the reason we are using CORS.
const allowedOrigins = [
  'https://darling-raindrop-2ce390.netlify.app',
  'https://emt-react.onrender.com',
  'http://localhost:5173'
]
const corsOptions = {
  origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log("allowed Origin: ", origin);
        callback(null, true)
      } else {
          callback(new Error('Not allowed by CORS'))
      }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
// This middleware is responsible for parsing incoming request
// bodies with JSON payloads. When a client sends a request
// with a JSON payload, such as in the case of an API call,
// express.json() middleware parses the JSON data and populates
// the req.body property with the parsed JSON object.
app.use(express.json());
app.use(express.Router().get('/',(req, res, next) => res.status(200).send("App Working")))
app.use("/auth",auth)
app.use("/profile",profile)
app.use("/admin",admin)
app.use("/user", user)


/**
 * {err object with status and message}
 */
app.use((err, req, res, next) => {
    // console.log(req.isAuthenticated());
    // console.log("Error Handler: ",res);
    // console.log(`Error in index.js: ${err.status} ${err.message}`);
      const errStatus = err.status || 500;
      const errMessage = err.message || "Something went wrong!!!";
      return res.status(errStatus).json({
        success: false,
        message: errMessage,
        status: errStatus,
      });
    });
  
  // Server started listening
  const port = process.env.PORT;
  app.listen(port, () => console.log(`Server running on port ${port}`));
  
