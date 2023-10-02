const {auth} = require("../controllers/authController");
const {log} = require("../util/consoleUtil");


/**
 * TODO
 * @param req
 * @param res
 * @param next
 */
exports.tokenValidator = (req, res, next) => {
  const token = getToken(req)
  log("Checking token: " + token?.substring(0, 10) + "...")
  log("Route : " + req.originalUrl)
  if (token) {
    auth.validateAccessToken(token).then(result => {
      if (result.err) {
        res.status(401).json({message: "Invalid Access Token"})
      } else {
        if (result.user) {
          res.locals.user = result.user;
          res.locals.accessToken = token;
          next()
        }
      }
    })
  } else {
    res.status(401).json({message: "Missing access token in the request"});
  }
}


/**
 * TODO
 * @param req
 * @returns {*|null|string}
 */
const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer ...
    // Handle token presented as a Bearer token in the Authorization header
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.accessToken) {
    // Handle token presented as URI param
    return req.query.accessToken;
  } else if (req.cookies && req.cookies.accessToken) {
    // Handle token presented as a cookie parameter
    return req.cookies.accessToken;
  }
  // If we return null, we couldn't find a token.
  // In this case, the JWT middleware will return a 401 (unauthorized) to the client for this request
  return null;
}