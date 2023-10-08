const {Authenticator} = require( "../auth/Authenticator");
const {Model} = require ("../models/model");
const {log, logErr} = require("../util/consoleUtil");
const {Request, Response} = require("express")

const auth = new Authenticator(Model);
exports.auth = auth;
const SECURE_COOKIE = true; // if set to true, the cookie will be accessible only through https (not development mode)

/**
 * Controller handling refresh of the access Token. It uses a refresh token and the old access token to obtain a new
 * valid access token. It responds with status 401 if the validation of the refresh token was unsuccessful or if there
 * were missing parameters (refresh Token in the cookies or the access token in the body) or with a <code>message</code>
 * and the <code>token</code> if the process was successful.
 * @author Valerio Di Zio <valerio.dizio@studio.unibo.it>, Francesco Magnani <francesco.magnani14@studio.unibo.it>,
 * Thomas Capelli <thomas.capelli@studio.unibo.it>
 * @param req {Request} - Express request, must contain the access token in the body
 * @param res {Response} - Express response
 */
exports.refresh = (req, res) => {
    try {
        if (req.cookies.refreshToken && req.body.accessToken) {
            auth.refreshToken(req.cookies.refreshToken).then(result => {
                if (result.err) {
                    logErr(result.err)
                    res.status(401).json({message: 'Unauthorized'});
                } else {
                    res.status(200)
                        .json({
                            "message": "Refreshed successfully",
                            "token": result.token
                        });
                }
            })
        } else {
            res.status(401).json({message: 'Unauthorized'});
        }
    } catch (e) {
        res.status(500).end();
    }
}

/**
 * Controller handling the logout process. It clears the refresh token in the cookies and responds with a <code>message</code>
 * if the process was successful, with status 405 if the user didn't appear as logged in, status 500 otherwise.
 * @author Valerio Di Zio <valerio.dizio@studio.unibo.it>, Francesco Magnani <francesco.magnani14@studio.unibo.it>,
 * Thomas Capelli <thomas.capelli@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response
 */
exports.logout = (req, res) => {
    try {
        if (req.cookies?.refreshToken) {
            res.clearCookie("refreshToken");
            res.status(200).json({message: "Logged out successfully"});
        } else {
            res.status(405).json({message: "You have to be already logged in to log out"});
        }
    } catch (e) {
        res.status(500).end();
    }
}

/**
 * Controller handling the register process. The body of the request must contain <code>username, password, first_name
 * </code>and <code>last_name</code>. It responds with status 400 and <code>message</code> if something went wrong
 * (for example, already existing user) or if some parameter was missing in the body. If all was successful, it responds
 * with a <code>message</code> and the <code>user</code> (without the password)
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @param req {Request} - Express request
 * @param res {Response} - Express response
 */
exports.register = (req, res) => {
    try {
        if (req.body.username && req.body.password && req.body.first_name && req.body.last_name) {
            const {username, password, first_name, last_name} = req.body;
            auth.register({first_name: first_name, last_name: last_name, username: username, password: password})
                .then((result) => {
                    if (result.err) {
                       logErr("Error: " + result.err)
                        res.status(400).json({message: result.err})
                    } else {
                        const created = result.user;
                        const noPasswordUser = {
                            id: created.id, username: created.username,
                            first_name: created.first_name, last_name: created.last_name
                        };
                        log("Created user " + JSON.stringify(noPasswordUser));
                        res.status(200)
                            .json({
                                "message": "User created successfully",
                                "user": noPasswordUser
                            });
                    }

                });
        } else {
            res.status(400).json({
                "message": "Bad input, please provide username, password, " +
                    "first name and last name"
            })
        }
    } catch (e) {
        res.status(500).end();
    }
}

/**
 * Controller handling the login process. The body of the request must contain <code>username</code> and <code>password</code>
 * of the user. It responds with status 400 if something went wrong or if some of the parameters were missing inside the
 * body of the request. It the process was successful, it responds with <code>message</code>, <code>accessToken</code>,
 * <code>name</code>, <code>userId</code> and <code>username</code> of the user and also setting a secure cookie named
 * <code>refreshToken</code> containing the refresh token of the user.
 * @param req {Request} - Express request
 * @param res {Response} - Express response
 */
exports.login = (req, res) => {
    try {
        if (req.body.username && req.body.password) {
            const {username, password} = req.body;
            auth.login({username: username, password: password})
                .then((result) => {
                    if (result.err) {
                        logErr("Error: " + result.err)
                        res.status(400).json({message: result.err})
                    } else {
                        const logged = result.user;
                        const noPasswordUser = {id: logged.id, username: logged.username};
                        res.cookie("refreshToken", logged.refreshToken,
                            {
                                httpOnly: true,
                                secure: SECURE_COOKIE,
                                maxAge: 60 * 60 * 24 * 1000,
                                sameSite: 'none'
                            }
                        )
                        log("Logged user " + JSON.stringify(noPasswordUser));
                        res.status(200)
                            .json({
                                "message": "User logged successfully",
                                "accessToken": logged.accessToken,
                                "name": logged.first_name,
                                "userId": noPasswordUser.id,
                                "username": noPasswordUser.username
                            });
                    }

                });
        } else if (req.cookies && req.cookies.refreshToken) {
            auth.validateRefreshToken(req.cookies.refreshToken).then(result => {
                if (result.err) {
                    res.status(401).json({"message": "Invalid Token"});
                } else {
                    res.status(200)
                        .json({"message": "Already logged in"});
                }
            })
        } else {
            res.status(400).json({"message": "Bad input, please provide username and password"})
        }
    } catch (e) {
        res.status(500).end();
    }
}
