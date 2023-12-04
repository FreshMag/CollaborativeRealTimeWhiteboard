const { MongoMemoryServer } = require('mongodb-memory-server');
const {userSchema, whiteboardSchema, notificationSchema} = require("../src/models/dbModel");
const mongoose = require('mongoose');
const request = require("supertest");
const app = require("../server");
require("dotenv").config();

let USER_ID = "";
let ACCESS_TOKEN = "";


let mongod;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.DB_ADDRESS = mongod.getUri();
    await mongoose.connect(process.env.DB_ADDRESS, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

const User = mongoose.model('User', userSchema);
const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);
const Notification = mongoose.model('Notification', notificationSchema);

/* Closing database connection after each test. */
afterAll(async () => {
    await User.findByIdAndDelete(USER_ID).then(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });
});

describe("POST /api/register", () => {
    it("Test User Registration", async () => {
        await request(app).post("/api/auth/register").send({username: "user@test.it", password: "password", first_name:"Mario", last_name:"Rossi"}).then((res) => {
            expect(res.statusCode).toBe(200);
            USER_ID = res.body.user.id;
            expect(res.body.user.username).toBe("user@test.it");
        });
    });
});

describe("POST /api/login", () => {
    it("Test User Login", async () => {
        await request(app).post("/api/auth/login").send({username: "user@test.it", password: "password"}).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe("user@test.it");
            ACCESS_TOKEN = res.body.accessToken;
        });
    });
});


