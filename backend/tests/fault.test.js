const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

const {User, Whiteboard} = require("../src/models/dbModel");

let USER_ID = "";
let ACCESS_TOKEN = "";
let CREATED_WHITEBOARDS = []

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
  await User.findByIdAndDelete(USER_ID)
  for (let whiteboard in CREATED_WHITEBOARDS) {
    await Whiteboard.findByIdAndDelete(whiteboard._id)
  }
  await mongoose.connection.close()
});

async function testRoute(route, payload, method, accessToken, status=401) {
  const test = request(app);
  if (!accessToken) {
    const res = await test[method](route)
        .send(payload)
    expect(res.statusCode).toBe(status);
  } else {
    console.log(payload)
    const res = await test[method](route)
        .send(payload)
        .set({ Authorization: `Bearer ${accessToken}` })
    expect(res.statusCode).toBe(status);
  }
}

describe("Missing Authorization Header", () => {
  it("Test common routes with missing Authorization Header", async () => {
    const test_data = [
      {route: "/api/profile/createWhiteboard", payload: {whiteboardName: ""}, method: "post"},
      {route: "/api/profile/updateWhiteboard", payload: {whiteboardId: "", newName: ""}, method: "put"},
      {route: "/api/profile/deleteWhiteboard", payload: {whiteboardId: ""}, method: "delete"}
    ]
    for (const data of test_data) {
      await testRoute(data.route, data.payload, data.method, "");
    }
  });
});

describe("Missing Data in the Request", () => {
  it("Test common routes with missing data", async () => {
    const test_data = [
      {route: "/api/profile/updateWhiteboard", payload: {}, method: "put"},
      {route: "/api/profile/deleteWhiteboard", payload: {}, method: "delete"}
    ]
    for (const data of test_data) {
      await testRoute(data.route, data.payload, data.method, ACCESS_TOKEN, 400);
    }
  });
});