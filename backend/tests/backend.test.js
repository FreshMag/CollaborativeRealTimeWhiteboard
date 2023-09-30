const mongoose = require("mongoose");

const {TestModel} = require("../src/models/testModel");
require("dotenv").config();
let db;
beforeAll(async () => {
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

describe("POST /api/createWhiteboard", () => {
    it("Test Whiteboard Creation", async () => {
        this.db.createWhiteboard("Whiteboard 0", "user1").then((toCreate) => {
            this.db.findOneWhiteboard(toCreate.id).then((whiteboard) => {
                expect(whiteboard.id).toBe(toCreate.id);
                expect(whiteboard.name).toBe("Whiteboard 0");
            });
        });
        this.db.createWhiteboard("Whiteboard 1", "user1").then((toCreate) => {
            this.db.findOneWhiteboard(toCreate.id).then((whiteboard) => {
                expect(whiteboard.id).toBe(toCreate.id);
                expect(whiteboard.name).toBe("Whiteboard 1");
            });
        });
    });
});

describe("DELETE /api/deleteWhiteboard", () => {
    it("Test Whiteboard Delete", async () => {
        this.db.deleteWhiteboard(0).then(() => {
            this.db.findOneWhiteboard(0).then((whiteboard) => {
                expect(whiteboard).toBe(undefined);
            });
        });
    });
});

