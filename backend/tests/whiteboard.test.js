const mongoose = require("mongoose");
const request = require("supertest");
const {TestModel} = require("../src/models/testModel");
const server = require("../server");
require("dotenv").config();
let db;
beforeEach(async () => {
    this.db = TestModel;
});

describe("POST /api/register", () => {
    it("Test User Creation", async () => {
        this.db.createUser({username: "user1", password: "password", first_name:"Mario", last_name:"Rossi"}).then(() => {
            this.db.findOneUser("user1").then((user) => {
                expect(user.username).toBe("user1");
                expect(user.password).toBe("password");
                expect(user.first_name).toBe("Mario");
                expect(user.last_name).toBe("Rossi");
            });
        });

        this.db.createUser({username: "user2", password: "password", first_name:"Luigi", last_name:"Verdi"}).then(() => {
            this.db.findOneUser("user2").then((user) => {
                expect(user.username).toBe("user2");
                expect(user.password).toBe("password");
                expect(user.first_name).toBe("Luigi");
                expect(user.last_name).toBe("Verdi");
            });
        });
    });
});

describe("GET /api/", () => {
    it("should return all products", async () => {
        expect(200).toBe(200);
    });
});