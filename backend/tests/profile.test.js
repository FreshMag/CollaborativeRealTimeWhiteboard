const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

const {User} = require("../src/models/dbModel");

let USER_ID = "";
let ACCESS_TOKEN = "";
beforeAll(async () => {
  await mongoose.connect(process.env.DB_ADDRESS);
  await request(app).post("/api/auth/register").send({username: "user@test.it", password: "password", first_name:"Mario", last_name:"Rossi"}).then((res) => {
    expect(res.statusCode).toBe(200);
    USER_ID = res.body.user.id;
    expect(res.body.user.username).toBe("user@test.it");
  });
  await request(app).post("/api/auth/login").send({username: "user@test.it", password: "password"}).then((res) => {
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("user@test.it");
    ACCESS_TOKEN = res.body.accessToken;
  });
});

/* Closing database connection after each test. */
afterAll(async () => {
  await User.findByIdAndDelete(USER_ID).then(async () => {
    await mongoose.connection.close().then(() => {
    });
  });
});
describe("GET /api/profile/", () => {
  it("Test User Get Profile", async () => {
    await request(app).get("/api/profile/")
        .send()
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.whiteboards.length).toBe(0)
    });
  });
});