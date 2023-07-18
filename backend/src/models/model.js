const {log} = require("../util/consoleUtil");
const mongoose = require("mongoose");
const {User, Whiteboard} = require("../models/dbModel");

class RealDb {
    constructor() {
        mongoose.connect('mongodb://localhost:27017/whiteboard-db')
            .then(() => {log("MI SONO CONNESSOOOOOOOO!")})
            .catch((e)=>{console.error(e)});
    }

    async findOneUser(username) {
        try{
            return (await User.findOne({'username': username}));
        } catch (e) {
            return e;
        }
    }
    async findOneWhiteboard(whiteboardId) {
        try{
            return (await Whiteboard.findById(whiteboardId));
        } catch (e) {
            return e;
        }
    }

    async createUser(user) {
        const toCreate = {
            username: user.username,
            password: user.password,
            first_name: user.first_name,
            last_name: user.last_name,
            notifications: []
        };
        try{
            return (await new User(toCreate).save());
        } catch (e)  {
            return e;
        }
    }

    async createWhiteboard(name, username) {
        const user = await this.findOneUser(username)
        const userId = user?._id;
        if (user) {
            const toCreate = {
                name: name,
                ownerId: userId,
                traits: {},
                freeId: 0,
                users: [userId]
            }

            try{
                const currentWhiteboard  = await new Whiteboard(toCreate).save();
                return currentWhiteboard;
            }catch (e){
                console.log(e);
                return e;
            }
        }

    }

    async updateWhiteboard(whiteboardId, newName) {
        try {
            return (await Whiteboard.findByIdAndUpdate(whiteboardId,{name: newName}));
        } catch (e) {
            console.error(e);
        }
    }

    async deleteWhiteboard(whiteboardId) {
        try {
            const whiteboard = await Whiteboard.findById(whiteboardId)
            // remove the whiteboard from all the profiles
            if (whiteboard) {
                await Whiteboard.findByIdAndDelete(whiteboardId);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async generateFreshLineId(whiteboardId) {
        const lineId = await new mongoose.Types.ObjectId();
        console.log("lineID " + lineId);
        return lineId;
    }

    async insertLine(whiteboardId, lineId, line){
        const object = {};
        object[`traits.${lineId}`] = line;
        try {
            await Whiteboard.findOneAndUpdate({_id: whiteboardId}, object);
        } catch (e) {
            console.error(e);
        }
    }

    async deleteLine(whiteboardId, lineId) {
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
            const whiteboard = (await Whiteboard.findById(whiteboardId));
            return whiteboard.users.includes(user._id)
        }
    }
    async validateOwnerToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        const whiteboard = await this.findOneWhiteboard(whiteboardId);
        if (user && whiteboard) {
            return whiteboard.owner === user._id;
        }
    }

    async getWhiteboards(username) {
        const user = await this.findOneUser(username);
        if (user !== undefined) {
            try {
                return (await Whiteboard.find({users: {$in: [user._id]}}));
            } catch (e) {
                console.error(e);
            }
        }

    }

    async getUsersWithFilters(filters) {
        const LIMIT = 20;
        if (filters) {
            const out = [];
            const word = filters.username
            const users = await (User.find({
                "$and": [{username: {
                        "$regex": word,
                        "$options": "i"
                    }
                }, {username: {"$ne": filters.excludes}}]
            }));
            const usersAlreadyIn = (await Whiteboard.find({_id: filters.whiteboardId}, {users: 1}));
            console.log(users);
            console.log(usersAlreadyIn);
            for (let i = 0; i < users.length && i < LIMIT; i++) {
                const user = users[i];
                out.push({id: user._id, username: user.username, first_name: user.first_name, last_name: user.last_name,
                    alreadyIn: usersAlreadyIn.includes(user._id)});
            }
            return {users: out};
        } else {
            return (await User.find({}));
        }
    }
}
exports.Model = new RealDb();