const { Request, Response } = require('express')
const {Model} = require ("../models/model");
const {fail, failMissingElement} = require("./utility/shortcuts");

/**
 * Controller used to get user data. It responds with <code>user</code> or status 500 if there was something wrong using
 * <code>res.locals</code>. Like all the protected routes, it assumes that the access token has been already validated
 * by some other middleware
 * @author Thomas Capelli <thomas.capelli@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response
 */
exports.getUserData = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else {
        const {user} = res.locals;
        Model.findOneUser(user.username).then(user => {
            res.status(200).json(user);
        })
    }
}
/**
 * Controller used to update user data. It responds with <code>user</code> or status 500 if there was something wrong using
 * <code>res.locals</code>. The body contains optional parameters: <code>first_name</code> and <code>last_name</code>.
 * Like all the protected routes, it assumes that the access token has been already validated by some other middleware
 * @author Thomas Capelli <thomas.capelli@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response
 */
exports.updateInfo = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else {
        const {user} = res.locals;
        Model.updateUserInfo(user.username, user.username, req.body?.first_name, req.body.last_name).then(user => {
            res.status(200).json(user);
        })
    }
}

/**
 * Controller used to update user password. It responds with a <code>message</code> or status 500 if there was something
 * wrong using <code>res.locals</code>. The body of the request must contain the new <code>password</code>.
 * Like all the protected routes, it assumes that the access token has been already validated by some other middleware
 * @author Thomas Capelli <thomas.capelli@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response
 */
exports.updatePassword = (req, res) => {
    if (!res.locals.user) {
        fail(res);
    } else if (!req.body.password) {
        failMissingElement(res, "user", "password")
    } else {
        const {user} = res.locals;
        Model.updateUserPassword(user.username, req.body.password).then((result) => {
            if (result.err) {
                res.status(500).json({message: "Something went wrong"})
            } else {
                res.status(200).json({message: "User data updated successfully"});
            }
        })
    }
}

