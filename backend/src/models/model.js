const {logSuccess} = require("../util/consoleUtil");
const mongoose = require("mongoose");
const {User, Whiteboard, Notification} = require("../models/dbModel");
const {checkContains} = require("../util/arrayUtil")
const bcrypt = require("bcrypt");

/**
 * Class that handles all the interaction with the database. All the useful requests to the database are extracted as
 * methods of this class.
 */
class RealDb {
    /**
     * Primary constructor. It tries to connect to the database, and then prints the outcome in the console.
     */
    constructor() {
        this.dbAddress = process.env.DB_ADDRESS;
        console.log(this.dbAddress)
        mongoose.connect(this.dbAddress)
            .then(() => {logSuccess(`Successfully connected to ${this.dbAddress}`)})
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

    async updateUserInfo(username, newUsername, newFirstName, newLastName) {
        const user = await this.findOneUser(username);
        const alreadyExisting = await this.findOneUser(newUsername);
        if (user && (!alreadyExisting || (newUsername === username))) {
            return (await User.findByIdAndUpdate(user._id,{username: newUsername, first_name: newFirstName, last_name: newLastName},
                {returnDocument: 'after'}));
        }
        return null;
    }

    async updateUserPassword(username, password) {
        const user = await this.findOneUser(username);
        const hashedPassword = await bcrypt.hash(password, 10);
        if(user) {
            try {
                return (await User.findByIdAndUpdate(user._id, {password: hashedPassword},
                    {returnDocument: 'after'}));
            } catch (e) {
                return {err: e}
            }
        } else {
            return {err: "Username does not exists"}
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
                users: [userId]
            }
            try{
                return (await new Whiteboard(toCreate).save());
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
        return (await new mongoose.Types.ObjectId());
    }

    async insertLine(whiteboardId, lineId, line){
        try {
            const update = { }
            const string = `traits.${lineId}`;
            const trait = {}
            trait[string] = line;
            update["$set"] = trait;
            await Whiteboard.findOneAndUpdate({_id: whiteboardId}, update);
        } catch (e) {
            console.error(e);
        }
    }

    async deleteLine(whiteboardId, lineId) {
        const update = { }
            const string = `traits.${lineId}`;
            const trait = {}
            trait[string] = 1;
            update["$unset"] = trait;
            await Whiteboard.findOneAndUpdate({_id: whiteboardId}, update);
    }

    async inviteUserToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        const whiteboard = await this.findOneWhiteboard(whiteboardId);
        if (!whiteboard.users.includes(user.id) ) {
            await Whiteboard.findByIdAndUpdate(whiteboardId, {$push: {users: user._id}})
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
            return user._id.equals(whiteboard.ownerId);
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
                "$and": [{first_name: {
                        "$regex": word,
                        "$options": "i"
                    }
                }, {first_name: {"$ne": filters.excludes}}]
            }));
            const usersAlreadyIn = (await Whiteboard.findById(filters.whiteboardId).select("users").lean()).users;
            for (let i = 0; i < users.length && i < LIMIT; i++) {
                const user = users[i];
                out.push({id: user._id, username: user.username, first_name: user.first_name, last_name: user.last_name,
                    alreadyIn: checkContains(usersAlreadyIn, user._id)});
            }
            return {users: out};
        } else {
            return (await User.find({notifications: {}}));
        }
    }

    async getNotificationOfUser(username) {
        const user = await this.findOneUser(username);
        if (user !== undefined) {
            try {
                return (await Notification.find({user: user._id}));
            } catch (e) {
                console.error(e);
            }
        }

    }

    async addNotificationForUser(notification, username) {
        const user = await this.findOneUser(username);
        if (user !== undefined) {
            try {
                const notificationToAdd = {};
                notificationToAdd.body = notification.body;
                notificationToAdd.type = notification.type;
                notificationToAdd.visualized = false;
                notificationToAdd.user = user._id;
                await new Notification(notificationToAdd).save();
            } catch (e) {
                console.error(e)
            }

        }
    }

    async deleteNotification(notificationId, username) {
        try {
            const notification = await Notification.findById(notificationId)
            const user = this.findOneUser(username)
            // remove the notification from all the profiles
            if (notification && user) {
                return await Notification.findByIdAndDelete(notificationId);
            }
        } catch (e) {
            return {err: e}
        }
    }

    async updateNotification(notificationId) {
        try {
            const notification = await Notification.findById(notificationId)
            // check if exist firts
            if (notification) {
                await Notification.findByIdAndUpdate(notification._id, {visualized: true});
            }
        } catch (e) {
            console.error(e);
        }
    }

    async getUnreadNotificationNumber(username){
        const user = await this.findOneUser(username);
        return (await Notification.count({visualized: false, user: user._id}));

    }

}
exports.Model = new RealDb();