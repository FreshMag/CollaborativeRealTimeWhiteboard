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
const User = mongoose.model('User', userSchema);
const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);
const Notification = mongoose.model('Notification', notificationSchema);

let USER_ID = "";
let ACCESS_TOKEN = "";
let WHITEBOARD_ID = 0;
let mongod;
let clientSocket;

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
    USER_ID = userResponse.body.user.id;
    expect(userResponse.body.user.username).toBe("user@test.it");

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            username: "user@test.it",
            password: "password",
        });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.username).toBe("user@test.it");
    ACCESS_TOKEN = loginResponse.body.accessToken;

    const createResponse = await request(app).post("/api/profile/createWhiteboard")
        .send({whiteboardName: "Test Realtime"})
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toHaveProperty("message")
    WHITEBOARD_ID = createResponse.body.whiteboardId

    const server = http.createServer();
    const rt = new Realtime(server, whiteboardController);
    rt.listen();

    await new Promise((resolve) => {
        server.listen(4000, () => {
            clientSocket = io.connect('http://localhost:4000', {query: {
                    "accessToken": ACCESS_TOKEN
                }});
            clientSocket.on("connect", () => {
                resolve();
            });
        });
    });
});

afterAll(async () => {
    await User.findByIdAndDelete(USER_ID);
    await Whiteboard.findByIdAndDelete(WHITEBOARD_ID);
    mongoose.disconnect();
    await mongod.stop();
    clientSocket.disconnect();
});

test("Test Whiteboard Connection", () => {
    clientSocket.emit("joinWhiteboard", ACCESS_TOKEN, WHITEBOARD_ID, (response) => {
        expect(response.status).toBe('ok')
    });
});
