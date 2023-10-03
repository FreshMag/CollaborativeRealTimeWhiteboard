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

async function profileHasOneWhiteboardWith(name) {
  const newProfileResponse = await request(app).get("/api/profile/")
      .send()
      .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
  expect(newProfileResponse.statusCode).toBe(200);
  expect(newProfileResponse.body.whiteboards.length).toBe(1)
  const whiteboard = newProfileResponse.body.whiteboards[0];
  expect(whiteboard).toHaveProperty("_id")
  expect(whiteboard).toHaveProperty("ownerId")
  expect(whiteboard).toHaveProperty("users")
  expect(whiteboard.users.length).toBe(1)
  expect(whiteboard.users[0]).toBe(USER_ID)
  expect(whiteboard).toHaveProperty("name")
  expect(whiteboard.name).toBe(name)
}

async function profileHasZeroWhiteboards() {
  const newProfileResponse = await request(app).get("/api/profile/")
      .send()
      .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
  expect(newProfileResponse.statusCode).toBe(200);
  expect(newProfileResponse.body.whiteboards.length).toBe(0)
}



describe("GET /api/profile/", () => {
  it("Test User Get Profile and Whiteboard creation", async () => {
    await profileHasZeroWhiteboards()
    const createResponse = await request(app).post("/api/profile/createWhiteboard")
        .send({whiteboardName: "Test"})
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.body).toHaveProperty("message")
    expect(createResponse.body).toHaveProperty("whiteboardId")

    CREATED_WHITEBOARDS.push(createResponse.body.whiteboardId)

    await profileHasOneWhiteboardWith("Test")
  });
});

describe("GET /api/profile/updateWhiteboard", () => {
  it("Test Update of whiteboard", async () => {
    const res = await request(app).get("/api/profile/")
        .send()
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
    expect(res.statusCode).toBe(200);
    expect(res.body.whiteboards.length).toBe(1)
    const id = res.body.whiteboards[0]._id
    const updateResponse = await request(app).put("/api/profile/updateWhiteboard")
        .send({whiteboardId: id, newName: "New Test"})
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toHaveProperty("message")

    await profileHasOneWhiteboardWith("New Test")
  });
});

describe("GET /api/profile/deleteWhiteboard", () => {
  it("Test Delete of whiteboard", async () => {
    const res = await request(app).get("/api/profile/")
        .send()
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
    expect(res.statusCode).toBe(200);
    expect(res.body.whiteboards.length).toBe(1)
    const id = res.body.whiteboards[0]._id
    const deleteResponse = await request(app).delete("/api/profile/deleteWhiteboard")
        .send({whiteboardId: id})
        .set({ Authorization: `Bearer ${ACCESS_TOKEN}` })
    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toHaveProperty("message")

    if (CREATED_WHITEBOARDS.length === 1) {
      CREATED_WHITEBOARDS[0] = undefined;
    }
    await profileHasZeroWhiteboards()
  });
});


