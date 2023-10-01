// Test: backend.test.js
const request = require("supertest");
const {User} = require("../src/models/dbModel");
const app = require("../server");
const mongoose = require("mongoose");
require("dotenv").config();

USER_ID = "";

beforeAll(async () => {
    await mongoose.connect(process.env.DB_ADDRESS);
});

/* Closing database connection after each test. */
afterAll(async () => {
    await User.findByIdAndDelete(USER_ID).then(async () => {
        await mongoose.connection.close();
    });


});

describe("POST /api/register", () => {
    it("Test User Registration", async () => {
        await request(app).post("/auth/register").send({username: "user@test.it", password: "password", first_name:"Mario", last_name:"Rossi"}).then((res) => {
            expect(res.statusCode).toBe(200);
            USER_ID = res.body.user.id;
            expect(res.body.user.username).toBe("user@test.it");
        });
    });
});


