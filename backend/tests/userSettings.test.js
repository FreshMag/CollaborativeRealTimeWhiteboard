const { MongoMemoryServer } = require('mongodb-memory-server');
const { userSchema } = require("../src/models/dbModel");
const mongoose = require('mongoose');
const request = require("supertest");
const app = require("../server");
require("dotenv").config();

const User = mongoose.model('User', userSchema);

let USER_ID = "";
let ACCESS_TOKEN = "";

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.DB_ADDRESS = mongod.getUri();
    await mongoose.connect(process.env.DB_ADDRESS, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await request(app).post("/api/auth/register").send({ username: "user@test.it", password: "password", first_name: "Mario", last_name: "Rossi" }).then((res) => {
        expect(res.statusCode).toBe(200);
        USER_ID = res.body.user.id;
        expect(res.body.user.username).toBe("user@test.it");
    });
    await request(app).post("/api/auth/login").send({ username: "user@test.it", password: "password" }).then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe("user@test.it");
        ACCESS_TOKEN = res.body.accessToken;
    });
});



/* Closing database connection after each test. */
afterAll(async () => {
    await User.findByIdAndDelete(USER_ID);
    await mongoose.disconnect()
    await mongod.stop();
});

describe('GET /api/userSetting', () => {
    it("Test user data retrieval", async () => {
        const res = await request(app).get("/api/userSetting/")
            .send()
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        expect(res.statusCode).toBe(200);
        const user = res.body;
        expect(user.username).toBe("user@test.it");
        expect(user.first_name).toBe("Mario");
        expect(user.last_name).toBe("Rossi")
    })
})

describe('PUT /api/userSetting/updateInfo', () => {
    it("Test user data retrieval", async () => {
        await request(app).put("/api/userSetting/updateInfo")
            .send({
                first_name: "Thomas",
                last_name: "Capelli",
                username: "user@test.it"
            })
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        const res = await request(app).get("/api/userSetting/")
            .send()
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        const user = res.body;
        expect(res.statusCode).toBe(200);
        expect(user.username).toBe("user@test.it");
        expect(user.first_name).toBe("Thomas");
        expect(user.last_name).toBe("Capelli")
    })
})

describe('PUT /api/userSetting/updatePassword', () => {
    it("Test user data retrieval", async () => {
        const passRes = await request(app).put("/api/userSetting/updatePassword")
            .send({
                password: "newPassword"
            })
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        expect(passRes.statusCode).toBe(200)
        expect(passRes.body.message).toBe("User data updated successfully");
        const getRes = await request(app).get("/api/userSetting/")
            .send()
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        expect(getRes.statusCode).toBe(200);

    })
})
