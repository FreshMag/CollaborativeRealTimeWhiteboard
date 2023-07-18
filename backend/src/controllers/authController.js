const {Authenticator} = require( "../auth/Authenticator");
const {Model} = require ("../models/model");
const {log, logErr} = require("../util/consoleUtil");

const auth = new Authenticator(Model);
exports.auth = auth;
const SECURE_COOKIE = true; // if set to true, the cookie will be accessible only through https (not development mode)

exports.refresh = (req, res) => {
    console.log(req.cookies)
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
                                "refreshToken": logged.refreshToken,
                                "name": logged.first_name
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
