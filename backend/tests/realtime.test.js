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
                query: { "accessToken": ACCESS_TOKEN }
            });
            clientSocket2.on("connect", () => {
                checkAndResolve();
            });

            clientSocket = io.connect('http://localhost:4000', {
                query: { "accessToken": ACCESS_TOKEN }
            });
            clientSocket.on("connect", () => {
                checkAndResolve();
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

describe("Test Realtime Drawing", () => {
    it("Test Whiteboard Connection", async () => {
        clientSocket.emit("joinWhiteboard", ACCESS_TOKEN, WHITEBOARD_ID, (response) => {
            expect(response.status).toBe('ok')
        });
    });

    it("Test Whiteboard Draw Start", async () => {
        let lineToSend = {id: 1, point: [{x: 1, y: 1}], color: "Red", stroke: 1}
        clientSocket.emit("drawStart", lineToSend, ACCESS_TOKEN, (response) => {
            clientSocket2.on("drawStartBC", (line, _) => {
                expect(line).toBe(lineToSend);
            });
        });
    });

    it("Test Whiteboard Drawing", async () => {
        let lineToSend = {id: 1, point: [{x: 2, y: 2}], color: "Red", stroke: 2}
        clientSocket.emit("drawing", lineToSend, ACCESS_TOKEN,(response) => {
            clientSocket2.on("drawingBC", (line, lineId) => {
                expect(line).toBe(lineToSend);
                expect(lineId).toBe(2);
            });
        });
    });

    it("Test Whiteboard Draw End", async () => {
        let lineIdToSend = 2;
        let lineToSend = {id: 1, point: [{x: 3, y: 2}], color: "Red", stroke: 2}
        clientSocket.emit("drawEnd", lineToSend, lineIdToSend, ACCESS_TOKEN,(response) => {
            clientSocket2.on("drawEndBC", (line, lineId) => {
                expect(line).toBe(lineToSend);
                expect(lineId).toBe(2);
            });
        });

        const whiteboard = await request(app).get("/api/whiteboard/"+WHITEBOARD_ID)
            .send().set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        expect(whiteboard.body.whiteboardData._id).toBe(WHITEBOARD_ID);
        console.error(whiteboard.body) //check why no trait
    });

});
