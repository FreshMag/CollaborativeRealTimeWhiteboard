const {logErr, log} = require("../../util/consoleUtil");
const {auth} = require("../../controllers/authController");
const {Model} = require("../../models/model");

exports.createTestEnvironment = async () => {
    await registerLoginWithWhiteboard("admin@admin.com", "admin")
    await registerLoginWithWhiteboard("admin2@admin.com", "admin")
}

async function registerLoginWithWhiteboard(username, password) {
    await auth.register({first_name: "Test", last_name: "Test", username: username, password: password})
        .then((result) => {
            if (result.err) {
                logErr("Error: " + result.err)
            } else {
                const created = result.user;
                const noPasswordUser = {
                    id: created.id, username: created.username,
                    first_name: created.first_name, last_name: created.last_name
                };
                log("Created user " + JSON.stringify(noPasswordUser));

            }
        })

    let accessToken;
    await auth.login({username: username, password: password})
        .then((result) => {
            if (result.err) {
                logErr("Error: " + result.err)
            } else {
                const logged = result.user;
                const noPasswordUser = {id: logged.id, username: logged.username};

                log("Logged user " + JSON.stringify(noPasswordUser));
                log(`Access Token: ${logged.accessToken}`);
                accessToken = logged.accessToken;
            }

        });
    if (process.env.TEST_WHITEBOARD === "yes") {
        await auth.validateAccessToken(accessToken).then(result => {
            if (result.err) {
                logErr("Invalid Access Token");
            } else {
                if (result.user) {
                    const whiteboardName = "Test Whiteboard"
                    Model.createWhiteboard(whiteboardName, result.user.username).then(result => {
                        if (result) {
                            log(`Whiteboard created successfully, ID:${result._id}`);
                        } else {
                            logErr("Test ERROR")
                        }
                    })
                }

            }


        });
    }
}


