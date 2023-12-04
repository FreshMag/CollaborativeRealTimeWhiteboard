const express = require('express');
const {Authenticator} = require("../Authenticator");
const app = express();
const {serialize} = require("cookie");
var cookieParser = require('cookie-parser');
const {requestMethod} = require("../requestMethod");
const {Model} = require("../../models/model");
app.use(cookieParser());
app.use(express.json())
app.use(requestMethod);
const port = 3000;

const SECURE_COOKIE = false // if set to true, the cookie will be accessible only through https (not development mode)


const auth = new Authenticator(Model)
app.post('/register', (req, res) => {
    if (req.body.username && req.body.password && req.body.first_name && req.body.last_name) {
        const {username, password, first_name, last_name} = req.body;
        auth.register({first_name: first_name, last_name:last_name,username:username, password:password})
            .then((result) => {
                if (result.err) {
                    console.log("Error: " + result.err)
                    res.status(400).json({message: result.err})
                } else {
                    const created = result.user;
                    const noPasswordUser = {id: created.id, username:created.username,
                        first_name:created.first_name, last_name: created.last_name};
                    console.log("Created user " + JSON.stringify(noPasswordUser));
                    res.status(200)
                        .json({"message": "User created successfully",
                                    "user" : noPasswordUser});
                }

            });
    } else {
        res.status(400).json({"message" : "Bad input, please provide username, password, " +
                "first name and last name"})
    }
})

app.post("/login", (req, res) => {
    if (req.body.username && req.body.password) {
        const {username, password} = req.body;
        auth.login({username:username, password:password})
            .then((result) => {
                if (result.err) {
                    console.log("Error: " + result.err)
                    res.status(400).json({message: result.err})
                } else {
                    const logged = result.user;
                    const noPasswordUser = {id: logged.id, username:logged.username};
                    res.cookie("refreshToken", logged.refreshToken,
                        {httpOnly: true,
                                secure: SECURE_COOKIE,
                                maxAge:60 * 60 * 24 * 1000})

                    console.log("Logged user " + JSON.stringify(noPasswordUser));
                    res.status(200)
                        .json({"message": "User logged successfully",
                            "accessToken":logged.accessToken});
                }

            });
    } else if (req.cookies && req.cookies.refreshToken){
        auth.validateRefreshToken(req.cookies.refreshToken).then(result => {
            if (result.err) {
                res.status(401).json({"message": "Invalid Token"});
            } else {
                res.status(200)
                    .json({"message": "Already logged in"});
            }
        })
    } else {
        res.status(400).json({"message" : "Bad input, please provide username and password"})
    }
});

app.post("/logout", (req, res) => {
    if (req.cookies?.refreshToken) {
        res.clearCookie("refreshToken");
        res.status(200).end();
    } else {
        res.status(405).json({message:"You have to be already logged in to log out"});
    }
})

app.post("/refresh", (req, res) => {
   if (req.cookies?.refreshToken && req.body.accessToken) {
       auth.refreshToken(req.cookies.refreshToken).then(result => {
           if (result.err) {
               res.status(406).json({ message: 'Unauthorized' });
           } else {
               res.status(200)
                   .json({"message": "Refreshed successfully",
                       "token":result.token});
           }
       })
   } else {
       res.status(406).json({ message: 'Unauthorized' });
   }
});

app.post("/someResource", (req, res) => {
    if (req.body.accessToken && req.cookies?.refreshToken) {
        auth.validateAccessToken(req.body.accessToken).then(result => {
            if (result.err) {
                res.status(406).json({message: "Unauthorized"})
            } else {
                res.status(200).json({"message": "Access granted", "resource": 123})
            }
        })
    } else {
        res.status(401).json({message: "Unauthorized"});
    }
})

app.listen(port, () => console.log(`Server is running on port ${port}`));


