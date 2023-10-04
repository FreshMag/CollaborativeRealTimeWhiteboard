const {auth} = require("../controllers/authController");
const {log} = require("../util/consoleUtil");
const {Request, Response} = require("express");


/**
 * Useful middleware used for protected routes. It checks for the access token and validates it. It immediately responds
 * with status 401 + a <code>message</code> either if the token is not valid or if it's not present in the request. In
 * case of success, it sets 2 locals inside <code>res</code>, <code>user</code> and <code>accessToken</code>, useful for
 * the following handling process.
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response
 * @param next {Function} - Express Middleware handler
 */
exports.tokenValidator = (req, res, next) => {
  const token = getToken(req)
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
 * Utility function to parse express requests and obtain the access token contained inside the authorization header of
 * the request.
 * @author thebigredgeek
 * @param req {Request} - Express request. Must contain the accessToken inside one of the following: <code>req.headers.authorization</code>,
 * <code>req.query.accessToken</code> or <code>req.cookies.accessToken</code>
 * @returns {null|string} - A string with the access token, or null if the request doesn't contain it
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