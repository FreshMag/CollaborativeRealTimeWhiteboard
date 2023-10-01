// Test: backend.test.js
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
require("dotenv").config();
beforeEach(async () => {
    await mongoose.connect(`mongodb://${process.env['DB_IP']}:27017/whiteboard-db`);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe("POST /api/register", () => {
    it("Test User Creation", async () => {
        request(app).post("/auth/register").send({username: "user3123@unibo.it", password: "password", first_name:"Mario", last_name:"Rossi"}).then((res) => {
            console.error(res.body);
            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe("user3123@unibo.it");
        });
    });
});

