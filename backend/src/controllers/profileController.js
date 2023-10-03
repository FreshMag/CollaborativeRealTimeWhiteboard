const {Request, Response} = require('express');
const {Model} = require ("../models/model");
const {authZ} = require('./whiteboardController')
const {fail, failMissingElement, tryAuthorizeToWhiteboard} = require("./utility/shortcuts");

const DEFAULT_WHITEBOARD_NAME = "Lavagna di Prova";

/**
 * Controller handling whiteboards page, responds to the user with the list of whiteboards or status 500 if something
 * went wrong using <code>res.locals</code>. Like all the protected routes, assumes that access token has been already validated
 * by some other middleware
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response, responds with the list of whiteboards inside <code>whiteboards</code>
 */
exports.getProfile = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else {
        const {user} = res.locals;
        Model.getWhiteboards(user.username).then(whiteboards => {
            res.status(200).json({whiteboards: whiteboards});
        })
    }
}
/**
 * Controller handling whiteboard creation, responds to the user with the newly generated whiteboard id or status 500
 * if something went wrong using <code>res.locals</code>. Like all the protected routes, assumes that access token has been already
 * validated by some other middleware
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request, body can contain the name of the new whiteboard <code>whiteboardName</code>
 * @param res {Response} - Express response, responds with the newly generated whiteboard id inside <code>whiteboardId</code>
 */
exports.createWhiteboard = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else {
        const {user} = res.locals;
        const whiteboardName = req.body.whiteboardName ? req.body.whiteboardName : DEFAULT_WHITEBOARD_NAME
        Model.createWhiteboard(whiteboardName, user.username).then(result => {
            if (result) {
                res.status(200).json({message: "Message created successfully", whiteboardId: result.id});
            } else {
                res.status(500).end();
            }
        })
    }
}
/**
 * Controller handling whiteboard update, responds with status 400 if missing the whiteboard id the body. Like all the
 * protected routes, assumes that access token has been already validated by some other middleware
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request, body MUST contain the id of the whiteboard <code>whiteboardId</code> and its
 * <code>newName</code>
 * @param res {Response} - Express response, responds with <code>message</code>
 */
exports.updateWhiteboard = (req, res) => {
    if (!res.locals.accessToken) {
        fail(res)
    } else if (!req.body.whiteboardId) {
        failMissingElement(res)
    } else if (!req.body.newName) {
        failMissingElement(res, "whiteboard","new name")
    } else {
        const {accessToken} = res.locals;
        tryAuthorizeToWhiteboard(res, req.body.whiteboardId, accessToken, authZ.ownerToWhiteboard, authZ, () => {
            Model.updateWhiteboard(req.body.whiteboardId, req.body.newName).then(() => {
                res.status(200).json({message: "Whiteboard updated successfully"});
            })
        })
    }
}
/**
 * Controller handling whiteboard deletion, responds with status 400 if missing the whiteboard id the body,
 * with status 500 instead if something went wrong using <code>res.locals</code>. Like all the protected routes, assumes that
 * access token has been already validated by some other middleware
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request, body MUST contain the id of the whiteboard <code>whiteboardId</code>
 * @param res {Response} - Express response, responds with <code>message</code>
 */
exports.deleteWhiteboard = (req, res) => {
    if (!res.locals.accessToken) {
        fail(res)
    } else if (!req.body.whiteboardId) {
        failMissingElement(res)
    } else {
        const {accessToken} = res.locals;
        tryAuthorizeToWhiteboard(res, req.body.whiteboardId, accessToken, authZ.ownerToWhiteboard, authZ, () => {
            Model.deleteWhiteboard(req.body.whiteboardId).then(() => {
                res.status(200).json({message: "Whiteboard deleted successfully"});
            })
        })
    }
}
/**
 * Controller used for getting users given a set of filters, responds with status 400 if missing <code>filters</code>
 * inside the query, with status 500 instead if something went wrong using <code>res.locals</code>. Like all the protected routes,
 *  assumes that access token has been already validated by some other middleware
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request, query MUST contain filters inside <code>filters</code>
 * @param res {Response} - Express response, responds with matching users inside <code>users</code>
 */
exports.getUserWithFilters = (req, res) => {
    if (!res.locals.user) {
        fail(res)
    } else if (!req.query.filters) {
        res.status(400).json({message: "Missing filters in the query"})
    } else {
        const {user} = res.locals;
        const filters = req.query.filters;

        filters["excludes"] = user.username;

        Model.getUsersWithFilters(filters).then(result => {
            if (result.err) {
                res.status(500).json({message: "Cannot get users"})
            } else {
                res.status(200).json({users: result.users});
            }
        })
    }
}
/**
 * Controller used for getting the notifications of the user, responds with status 500 if something went wrong using
 * <code>res.locals</code> or if the model failed searching the notifications. Like all the protected routes, assumes
 * that access token has been already validated by some other middleware
 * @author Valerio Di Zio <valerio.dizio@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response, responds with the notification of the user inside <code>notification</code>
 */
exports.getNotificationOfUser = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else {
        const {user} = res.locals
        Model.getNotificationOfUser(user.username).then(result => {
            if (result.err) {
                fail(res)
            } else {
                res.status(200).json({notification: result});
            }
        });
    }
}
/**
 * Controller used for adding a notifications to the user, responds with status 400 if missing the notification or
 * the username in the request. Like all the protected routes, assumes
 * that access token has been already validated by some other middleware
 * @author Valerio Di Zio <valerio.dizio@studio.unibo.it>
 * @param req {Request} - Express request, containing <code>notification</code> and <code>username</code>
 * @param res {Response} - Express response, responds with a <code>message</code>
 */
exports.addNotificationForUser = (req, res) => {
    if (!req.body.notification || !req.body.username) {
        res.status(400).json({message: "Missing notification and username in the request"})
    } else {
        Model.addNotificationForUser(req.body.notification, req.body.username).then(() => {
            res.status(200).json({message: "Notification sent successfully"});
        });
    }
}
/**
 * Controller used for deleting a notification, responds with status 400 if missing the notification id in the query,
 * or with status 500 if something went wrong using <code>res.locals</code>.
 * Like all the protected routes, assumes that access token has been already validated by some other middleware
 * @author Valerio Di Zio <valerio.dizio@studio.unibo.it>
 * @param req {Request} - Express request, containing <code>id</code> of the notification in the query
 * @param res {Response} - Express response, responds with a <code>message</code>
 */
exports.deleteNotification = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else if (!req.query.id) {
        failMissingElement(res, "notification")
    } else {
        const {user} = res.locals;
        Model.deleteNotification(req.query.id, user.username).then((result) => {
            if (result?.err || !result) {
                fail(res)
            } else {
                res.status(200).json({message: "Notification deleted successfully"});
            }
        });
    }
}
/**
 * Controller used for updating a notification, responds with status 400 if missing the notification id in the body.
 * Like all the protected routes, assumes that access token has been already validated by some other middleware
 * @author Valerio Di Zio <valerio.dizio@studio.unibo.it>
 * @param req {Request} - Express request, containing <code>id</code> of the notification in the body
 * @param res {Response} - Express response, responds with a <code>message</code>
 */
exports.updateNotification = (req, res) => {
    if (!req.body.id) {
        failMissingElement(res, "notification")
    } else {
        Model.updateNotification(req.body.id).then(() => {
            res.status(200).json({message: "Notification updated successfully"});
        });
    }
}
/**
 * Controller used for getting all the number of un-read notifications, responds with status 500 if something went
 * wrong using <code>res.locals</code>.
 * Like all the protected routes, assumes that access token has been already validated by some other middleware
 * @author Valerio Di Zio <valerio.dizio@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response, responds with a <code>message</code>
 */
exports.getUnreadNotification = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else {
        const {user} = res.locals;
        Model.getUnreadNotificationNumber(user.username).then(numberOfNotifications =>{
            res.status(200).json({number: numberOfNotifications});
        });
    }
}

