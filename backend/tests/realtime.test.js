const { MongoMemoryServer } = require('mongodb-memory-server');
const { userSchema, whiteboardSchema, notificationSchema } = require("../src/models/dbModel");
const mongoose = require('mongoose');
const request = require("supertest");
const app = require("../server");
require("dotenv").config();
const io = require("socket.io-client");
const Realtime = require('../src/realtime/api/Realtime');
const whiteboardController = require("../src/controllers/whiteboardController");
const http = require("http");
const {response} = require("express");
const User = mongoose.model('User', userSchema);
const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);
const Notification = mongoose.model('Notification', notificationSchema);

let USER_ID_1 = "";
let ACCESS_TOKEN_1 = "";
let USER_ID_2 = "";
let ACCESS_TOKEN_2 = "";
let WHITEBOARD_ID = 0;
let mongod;
let clientSocket;
let clientSocket2;

let socketConnectionPromise;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.DB_ADDRESS = mongod.getUri();
    await mongoose.connect(process.env.DB_ADDRESS, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const userResponse = await request(app)
        .post("/api/auth/register")
        .send({
            username: "user@test.it",
            password: "password",
            first_name: "Mario",
            last_name: "Rossi",
        });

    expect(userResponse.statusCode).toBe(200);
    USER_ID_1 = userResponse.body.user.id;
    expect(userResponse.body.user.username).toBe("user@test.it");

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            username: "user@test.it",
            password: "password",
        });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.username).toBe("user@test.it");
    ACCESS_TOKEN_1 = loginResponse.body.accessToken;

    const userResponse2 = await request(app)
        .post("/api/auth/register")
        .send({
            username: "user22@test.it",
            password: "password",
            first_name: "Mario",
            last_name: "Rossi",
        });

    expect(userResponse2.statusCode).toBe(200);
    USER_ID_2 = userResponse2.body.user.id;
    expect(userResponse2.body.user.username).toBe("user22@test.it");

    const loginResponse2 = await request(app)
        .post("/api/auth/login")
        .send({
            username: "user22@test.it",
            password: "password",
        });

    expect(loginResponse2.statusCode).toBe(200);
    expect(loginResponse2.body.username).toBe("user22@test.it");
    ACCESS_TOKEN_2 = loginResponse2.body.accessToken;

    const createResponse = await request(app).post("/api/profile/createWhiteboard")
        .send({whiteboardName: "Test Realtime"})
        .set({ Authorization: `Bearer ${ACCESS_TOKEN_1}` })
    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toHaveProperty("message")
    WHITEBOARD_ID = createResponse.body.whiteboardId

    const inviteResponse = await request(app).put("/api/whiteboard/invite").send({whiteboardId: WHITEBOARD_ID, username:userResponse2.body.user.username})
        .set({ Authorization: `Bearer ${ACCESS_TOKEN_1}` })
    expect(inviteResponse.statusCode).toBe(200);

    const server = http.createServer();
    const rt = new Realtime(server, whiteboardController);
    rt.listen();

    await new Promise((resolve) => {
        let connectedSockets = 0; // Variabile di stato per tener traccia dei socket connessi

        // Funzione per chiamare resolve solo quando entrambi i socket sono connessi
        function checkAndResolve() {
            connectedSockets++;
            if (connectedSockets === 2) {
                resolve();
            }
        }

        server.listen(4000, () => {
            clientSocket2 = io.connect('http://localhost:4000', {
                query: { "accessToken": ACCESS_TOKEN_2 }
            });
            clientSocket2.on("connect", () => {
                checkAndResolve();
            });

            clientSocket = io.connect('http://localhost:4000', {
                query: { "accessToken": ACCESS_TOKEN_1 }
            });
            clientSocket.on("connect", () => {
                checkAndResolve();
            });
        });
    });
});

afterAll(async () => {
    await User.findByIdAndDelete(USER_ID_1);
    await Whiteboard.findByIdAndDelete(WHITEBOARD_ID);
    await User.findByIdAndDelete(USER_ID_2);
    await mongoose.disconnect();
    await mongod.stop();
    await clientSocket.disconnect();
});

describe("Test Realtime Drawing", () => {
    let connectionPromise = new Promise((resolve) => {
        it("Test Whiteboard Connection", async () => {
            clientSocket.emit("joinApplication", ACCESS_TOKEN_1, (response) => {
                expect(response.status).toBe('ok')
                clientSocket2.emit("joinApplication", ACCESS_TOKEN_2, (response) => {
                    expect(response.status).toBe('ok')
                    resolve();
                });
            });
        })
    });

    let whiteboardConnectionPromise = new Promise((resolve) => {
        it("Test Whiteboard Connection", async () => {
            connectionPromise.then(() => {
                clientSocket.emit("joinWhiteboard", ACCESS_TOKEN_1, WHITEBOARD_ID, (response) => {
                    expect(response.status).toBe('ok')
                    clientSocket2.emit("joinWhiteboard", ACCESS_TOKEN_2, WHITEBOARD_ID, (response) => {
                        expect(response.status).toBe('ok')
                        resolve();
                    });
                });
            })
        })
    });
    let traitID;
    let drawStartPromise = new Promise((resolve) => {
        it("Test Whiteboard Draw Start", async () => {
            whiteboardConnectionPromise.then(() => {
                let lineToSend = {id: 1, point: [{x: 1, y: 1}], color: "Red", stroke: 1}
                clientSocket2.on("drawStartBC", (line, _) => {
                    expect(line).toStrictEqual(lineToSend);
                    resolve();
                });
                clientSocket.emit("drawStart", lineToSend, ACCESS_TOKEN_1, (res) => {
                    traitID = res.newId
                });
            });
        });
    });

    let drawingPromise = new Promise((resolve) => {
        it("Test Whiteboard Drawing", async () => {
            drawStartPromise.then(() => {
                let lineToSend = {id: 1, point: [{x: 2, y: 2}], color: "Red", stroke: 2}
                clientSocket2.on("drawingBC", (line, lineId) => {
                    expect(line).toStrictEqual(lineToSend);
                    expect(lineId).toBe(traitID);
                    resolve();
                });
                clientSocket.emit("drawing", lineToSend, traitID, ACCESS_TOKEN_1, (response) => {
                });
            })
        });
    });

    let drawEndPromise = new Promise((resolve) => {
        it("Test Whiteboard Draw End", async () => {
            drawingPromise.then(() => {
                let lineToSend = {id: 1, point: [{x: 3, y: 2}], color: "Red", stroke: 2}
                clientSocket2.on("drawEndBC", (line, lineId) => {
                    expect(line).toStrictEqual(lineToSend);
                    expect(lineId).toBe(traitID);
                    resolve();
                });
                clientSocket.emit("drawEnd", lineToSend, traitID, ACCESS_TOKEN_1);
            });
        });
    });

    it("Test Trait in Whiteboard",  (done)=>{
        drawEndPromise.then(() =>{
             request(app).get("/api/whiteboard/" + WHITEBOARD_ID)
                .send().set({Authorization: `Bearer ${ACCESS_TOKEN_1}`}).then((whiteboard) => {
                expect(whiteboard.body.whiteboardData._id).toBe(WHITEBOARD_ID);
                 done();
            })
        })
    })
});
