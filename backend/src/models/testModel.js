const {log} = require("../util/consoleUtil");
const bcrypt = require('bcrypt')

class Db {
    constructor() {
        this.userFreeId = 0;
        this.whiteboardFreeId = 0;
        this.users = [];
        this.whiteBoards = {};
    }

    async findOneUser(username) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].username === username) {
                return this.users[i];
            }
        }
        return undefined;
    }
    async findOneWhiteboard(whiteboardId) {
        for (const id in this.whiteBoards) {
            const whiteboard = this.whiteBoards[id];
            if (whiteboard?.id === parseInt(whiteboardId)) {
                return whiteboard;
            }
        }
        return undefined;
    }

    async createUser(user) {
        const toCreate = {
            id: this.userFreeId,
            username: user.username,
            password: user.password,
            first_name: user.first_name,
            last_name: user.last_name,
            notifications: [],
            whiteboards: []
        };
        this.users.push(toCreate);
        this.userFreeId++;
        return toCreate;
    }
    async updateUserInfo(username, newUsername, newFirstName, newLastName) {
        const user = await this.findOneUser(username);
        if (user) {
            user.username = newUsername;
            user.first_name = newFirstName;
            user.last_name = newLastName;
            return user;
        }
    }
    
    async updateUserPassword(username, password) {
        const user = await this.findOneUser(username);
        const encryptedPassword = await bcrypt.hash(password, 10);
        if(user) {
            user.password = encryptedPassword;
        }

    }

    async createWhiteboard(name, username) {
        const user = await this.findOneUser(username)
        const userId = user?.id;
        if (user) {
            const toCreate = {
                id: this.whiteboardFreeId,
                name: name,
                ownerId: userId, // todo check for valid user id
                traits: {},
                freeId: 0,
                users: [userId]
            }
            this.whiteBoards[this.whiteboardFreeId] = toCreate;
            user.whiteboards.push(this.whiteboardFreeId);
            this.whiteboardFreeId++;
            return toCreate;
        }

    }

    async updateWhiteboard(whiteboardId, newName) {
        const whiteboard = await this.findOneWhiteboard(whiteboardId);
        if (whiteboard) {
            whiteboard.name = newName;
        }
    }

    async deleteWhiteboard(whiteboardId) {
        const whiteboard = this.whiteBoards[whiteboardId];
        // remove the whiteboard from all the profiles
        if (whiteboard) {
            for (let i = 0; i < whiteboard.users.length; i++) {
                const user = this.users[whiteboard.users[i]];
                user.whiteboards.splice(user.whiteboards.indexOf(whiteboardId), 1);
            }
            this.whiteBoards[whiteboardId] = undefined;
        }

    }

    async generateFreshLineId(whiteboardId) {
        const whiteboard = this.whiteBoards[whiteboardId];
        const id = whiteboard.freeId;
        whiteboard.freeId++;
        while(whiteboard.traits[whiteboard.freeId] !== undefined) {
            whiteboard.freeId++;
        }
        return id;
    }

    async insertLine(whiteboardId, lineId, line){
        const whiteboard = this.whiteBoards[whiteboardId];
        whiteboard.traits[lineId] = line;
    }

    async deleteLine(whiteboardId, lineId){
        delete this.whiteBoards[whiteboardId].traits[lineId];
    }

    async inviteUserToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        const id = user.id;
        if (!this.whiteBoards[whiteboardId].users.includes(id)) {
            this.whiteBoards[whiteboardId].users.push(id);
            this.users[id].whiteboards.push(whiteboardId);
        }
    }
    async validateUserToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        if (user) {
            return this.whiteBoards[whiteboardId].users.includes(user.id);
        }
    }
    async validateOwnerToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        if (user) {
            return this.whiteBoards[whiteboardId].ownerId === user.id;
        }
    }

    async getWhiteboards(username) {
        const outWhiteboards = [];
        const user = await this.findOneUser(username);
        if (user !== undefined) {
            const ids = user.whiteboards;
            for (let i = 0; i < ids?.length; i++) {
                outWhiteboards.push(this.whiteBoards[ids[i]]);
            }
            return outWhiteboards;
        }

    }

    async getUsersWithFilters(filters) {
        const LIMIT = 20;
        if (filters) {
            const out = [];
            for (let i = 0; i < this.users.length && i < LIMIT; i++) {
                const user = this.users[i];
                if (user.username.includes((filters.username)) && (!filters.excludes?.includes(user.username))) {
                    let alreadyIn = false;
                    if (filters.whiteboardId !== undefined) {
                        alreadyIn = user.whiteboards.includes(parseInt(filters.whiteboardId));
                    }
                    out.push({id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name,
                        alreadyIn: alreadyIn});
                }
            }
            return {users: out};
        } else {
            return this.users.slice(0, LIMIT);
        }
    }
}
exports.TestModel = new Db();