
const {Response} = require('express');
const {Model} = require("../../models/model");
const {Authorizer} = require("../../auth/Authorizer")

/**
 * Shortcut function for sending an Internal Server Error response (status 500)
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param res {Response} - Express response
 */
exports.fail = (res) => {
  res.status(500).json({message: "Something went wrong"})
}

/**
 * Shortcut function for sending a Bad Request (status 400) response, specifically cause of missing elements in the request
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param res {Response} - Express response
 * @param entity {String?} - Entity whose id is missing in the request
 * @param missingElement {String?} - Element that is missing
 */
exports.failMissingElement = (res, entity="whiteboard", missingElement="ID") => {
  res.status(400).json({message: `Missing ${missingElement} of the ${entity} in the request`})
}

/**
 * Shortcut function for handling authorization to a whiteboard. This is manly done to reduce code duplication. It responds
 * with a Not Authorized (status 401) response if not successful
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param res {Response} - Express response, status 401 if authorization process was unsuccessful
 * @param whiteboardId {Object} - ID of the whiteboard to which the user is being authorized
 * @param accessToken {String} - Access token of the user
 * @param authorizerMethod {Function} - Async function that handles the authorization process, must take 2 parameters:
 * <code>accessToken</code> and <code>whiteboardId</code>
 * @param authorizer {Authorizer} - Instance of the Authorizer class
 * @param successHandler {Function} - Handler function, it is called in case of success
 */
exports.tryAuthorizeToWhiteboard = (res, whiteboardId, accessToken, authorizerMethod, authorizer,
                                    successHandler) => {
  authorizerMethod.call(authorizer, accessToken, whiteboardId).then(result => {
    const {err} = result;
    if (err) {
      res.status(401).json({message: err})
    } else {
      successHandler();
    }
  })
}