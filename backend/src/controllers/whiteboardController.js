const Authorizer = require("../auth/Authorizer");
const {Model} = require("../models/model");
const {Request, Response} = require('express');

const {auth} = require("./authController");
const {failMissingElement, fail, tryAuthorizeToWhiteboard} = require("./utility/shortcuts");

const authZ = new Authorizer(Model);
exports.authZ = authZ;

/*
    ----------------------------------------------------------------------------------------------------------------
    EXPRESS ROUTES
    ----------------------------------------------------------------------------------------------------------------
*/
/**
 * Controller used to get whiteboard data. It requires the whiteboard ID inside <code>id</code> as parameter to the request.
 * It responds to the user with all whiteboard's data, with status 400 if the ID of the whiteboard is missing, with status 401 if the
 * user is not authorized to this whiteboard or with status 500 if something went wrong using <code>res.locals</code>.
 * Like all the protected routes, it assumes that the access token has been already validated by some other middleware
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request, must contain <code>id</code> as param
 * @param res {Response} - Express response
 */
exports.getWhiteboardData = (req, res) => {
    if (!req.params?.id) {
        failMissingElement(res, "whiteboard")
    } else if (!res.locals.accessToken) {
        fail(res)
    } else {
        const {accessToken} = res.locals;
        tryAuthorizeToWhiteboard(res, req.params.id, accessToken, authZ.normalUserToWhiteboard, authZ,() => {
            Model.findOneWhiteboard(req.params.id).then(whiteboardData => {
                if (whiteboardData) {
                    res.status(200).json({whiteboardData: whiteboardData});
                } else {
                    res.status(404).json({message: "Not found"})
                }
            });
        });
    }
}
/**
 * Controller used to invite other users to this whiteboard. It requires both the whiteboard ID inside <code>whiteboardId</code>
 * and the username of the user inside <code>username</code> in the body.
 * It responds with status 400 if the ID of the whiteboard or the username is missing, with status 401 if the
 * user is not the owner of this whiteboard or with status 500 if something went wrong using <code>res.locals</code>.
 * Like all the protected routes, it assumes that the access token has been already validated by some other middleware
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request, must contain <code>whiteboardId</code> and <code>username</code> in the body
 * @param res {Response} - Express response, responds with a <code>message</code> if successful
 */
exports.inviteToWhiteboard = (req, res) => {
    if (!res.locals.accessToken) {
        fail(res);
    } else if (!req.body.username) {
        failMissingElement(res, "user", "username")
    } else if (!req.body.whiteboardId) {
        failMissingElement(res, "whiteboard", "ID")
    } else {
        const {accessToken} = res.locals;
        tryAuthorizeToWhiteboard(res, req.body.whiteboardId, accessToken, authZ.ownerToWhiteboard, authZ, () => {
            Model.inviteUserToWhiteboard(req.body.username, req.body.whiteboardId).then(() => {
                res.status(200).json({message: "User invited successfully"});
            })
        });
    }
}


/*
    ----------------------------------------------------------------------------------------------------------------
    THESE ARE THE ONES FOR SOCKET IO
    ----------------------------------------------------------------------------------------------------------------
*/

/**
 * Controller used to handle join whiteboard events. Typically used while handling real-time communications. It uses
 * the callback to handle the asynchronous behaviour.
 * @param accessToken {string} - Access token provided by the user to be authorized to the joining process
 * @param whiteboardId {string} - ID representing the whiteboard
 * @param callback {Function} - Callback. Called with <code>undefined, username</code> if the process was successful, or with
 * <code>err, undefined</code> otherwise
 */
exports.joinWhiteboard = (accessToken, whiteboardId, callback) => {
    authZ.normalUserToWhiteboard(accessToken, whiteboardId).then(result => {
        const {err, username} = result;
        if (err) {
            callback(err, undefined);
        } else {
            callback(undefined, username);
        }
    })
}

/**
 * Controller used to handle the user starting drawing a line inside the whiteboard. Typically used while handling
 * real-time communications. It uses the callback to handle the asynchronous behaviour.
 * @param line {Object} - The line being generated (optional)
 * @param accessToken {string} - Access token provided by the user to be authorized to the line starting process
 * @param whiteboardId {string} - ID representing the whiteboard
 * @param callback {Function} - Callback. Called with <code>undefined, id</code>, where the id represents the new line
 * just created, if the process was successful, or with <code>err, undefined</code> otherwise
 */
exports.lineStarted = (line, accessToken, whiteboardId, callback) => {
    authZ.authorizeNewLine(accessToken, whiteboardId).then(result => {
        const {err} = result;   // the authorizer generates fresh new line id
        if (err) {
            callback(err, undefined);
        } else {
            Model.generateFreshLineId(whiteboardId).then(id => {
                callback(undefined, id);
            })
        }
    })
}

exports.lineMove = (line, lineId, whiteboardId, callback) => {
    const {point, color} = line;
    callback();
}
/**
 * Controller used to handle the user ending a line (releasing the click or the touch) inside the whiteboard.
 * Typically used while handling real-time communications. It uses the callback to handle the asynchronous behaviour.
 * @param line {{points: Array, color: String, stroke: Number}} - The line, complete of all the points drawn.
 * @param accessToken {string} - Access token provided by the user to be authorized to the line ending process
 * @param lineId {string} - ID representing the line that is being ended
 * @param whiteboardId {string} - ID representing the whiteboard
 * @param callback {Function} - Callback. Called with <code>undefined</code> if the process was successful, or with
 * <code>err</code> otherwise
 */
exports.lineEnd = (line, accessToken, lineId, whiteboardId, callback) => {
    authZ.authorizeLineEnd(accessToken, lineId, whiteboardId).then(result => {
        if (result.err) {
            callback(result.err)
        } else {
            //console.log(line);
            Model.insertLine(whiteboardId, lineId, line).then((result) => {
                if (result?.err) {
                    callback(result.err)
                } else {
                    callback();
                }
            })
        }
    });
}

/**
 * Controller used to handle the user deleting a line inside the whiteboard.
 * Typically used while handling real-time communications. It uses the callback to handle the asynchronous behaviour.
 * @param lineId {String} - The ID representing the line to be deleted
 * @param accessToken {string} - Access token provided by the user to be authorized to the line deleting process
 * @param whiteboardId {string} - ID representing the whiteboard
 * @param callback {Function} - Callback. Called with <code>undefined</code> if the process was successful, or with
 * <code>err</code> otherwise
 */
exports.lineDelete = (lineId, accessToken, whiteboardId, callback) => {
    authZ.authorizeLineDelete(accessToken, lineId, whiteboardId).then(result => {
        if (result.err) {
            callback(result.err);
        } else {
            Model.deleteLine(whiteboardId, lineId).then(result => {
                if (result) {
                    callback(result.err)
                } else {
                    callback();
                }
            })
        }
    });
}

/**
 * This function is used to quickly check the user's access token when entering the application by using real time
 * communications.
 * @param accessToken {String} - Access token provided by the user to be authorized
 * @param callback {Function} - Callback. Called with <code>undefined, user</code> if the process was successful, or with
 * <code>err</code> otherwise
 */
exports.checkToken = (accessToken, callback) =>{
    auth.validateAccessToken(accessToken).then(result => {
        if(result.err){
            callback(result.err)
        }else{
            callback(undefined, result.user);
        }
    });
}
