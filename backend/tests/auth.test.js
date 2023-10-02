// Test: auth.test.js
const request = require("supertest");
const {User} = require("../src/models/dbModel");
const app = require("../server");
const mongoose = require("mongoose");
require("dotenv").config();

let USER_ID = "";
let ACCESS_TOKEN = "";

beforeAll(async () => {
    await mongoose.connect(process.env.DB_ADDRESS);
});

/* Closing database connection after each test. */
afterAll(async () => {
    await User.findByIdAndDelete(USER_ID).then(async () => {
        await mongoose.connection.close().then(() => {
        });
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


