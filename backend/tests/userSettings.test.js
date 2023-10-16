const { MongoMemoryServer } = require('mongodb-memory-server');
const { userSchema } = require("../src/models/dbModel");
const mongoose = require('mongoose');
const request = require("supertest");
const app = require("../server");
require("dotenv").config();

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

const User = mongoose.model('User', userSchema);

/* Closing database connection after each test. */
afterAll(async () => {
    await User.findByIdAndDelete(USER_ID).then(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });
});

describe('GET /api/userSetting', () => {
    it("Test user data retrieval", async () => {
        const res = await request(app).get("/api/userSetting/")
            .send()
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        expect(res.statusCode).toBe(200);
        expect(res.body.user.username).toBe("user@test.it");
        expect(res.body.user.first_name).toBe("Mario");
        expect(res.body.user.last_name).toBe("Rossi")
    })
})

describe('PUT /api/userSetting/updateInfo', () => {
    it("Test user data retrieval", async () => {
        const res = await request(app).get("/api/userSetting/")
            .send({
                first_name: "Thomas",
                last_name: "Capelli",
                username: "user@test.it"
            })
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        expect(res.statusCode).toBe(200);
        expect(res.body.user.username).toBe("user@test.it");
        expect(res.body.user.first_name).toBe("Thomas");
        expect(res.body.user.last_name).toBe("Capelli")
    })
})

describe('PUT /api/userSetting/updatePassword', () => {
    it("Test user data retrieval", async () => {
        const res = await request(app).get("/api/userSetting/")
            .send({
                username: "user@test.it",
                password: "Distribuiti"
            })
            .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User data updated successfully");
    })
})