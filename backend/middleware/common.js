const jwt = require("jsonwebtoken");
const { sendError } = require("../controllers/baseController.js");



const verifyAuth = async (req,res,next) => {
 try{
  // console.log("Request header: ", req.headers);
  // console.log("Request in middleware: ",req);
  const token = req.headers.authorization.split(" ")[1];
  if(revokedTokens.has(token)){
    return res.status(401).send(sendError(401, 'You are NOT authorized to access this resource because Invalid token'));
  }else{
    // console.log("RECEIVED token: ", token);
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  // console.log("User details decoded from token: ",decoded); //{email, exp, iat, id, name, role}
  req.userId = decoded.id;
  req.roleId = decoded.roleId;
  next();
  }
 }catch(error){
    console.log("Error in Middleware: ",error.message);
    return res.status(401).send(sendError(401,`You are NOT authorized to access this resource because Invalid token`));
 }
}

module.exports = {verifyAuth}