// Test: backend.test.js
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
require("dotenv").config();

USER_ID = "";

beforeAll(async () => {
    await mongoose.connect(process.env.DB_ADDRESS);
});

/* Closing database connection after each test. */
afterAll(async () => {
    await mongoose.connection.close();
});

describe("POST /api/register", () => {
    it("Test User Creation", async () => {
        await request(app).post("/auth/register").send({username: "user@test.it", password: "password", first_name:"Mario", last_name:"Rossi"}).then((res) => {
            expect(res.statusCode).toBe(200);
            USER_ID = res.body.user.id;
            expect(res.body.user.username).toBe("user@test.it");
        });
    });
});


