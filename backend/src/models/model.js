const { logSuccess } = require("../util/consoleUtil");
const mongoose = require("mongoose");
const { User, Whiteboard, Notification } = require("../models/dbModel");
const { checkContains } = require("../util/arrayUtil")
const bcrypt = require("bcrypt");

/**
 * Class that handles all the interaction with the database. All the requests to the database are extracted as
 * methods of this class.
 * @author Thomas Capelli <thomas.capelli@studio.unibo.it>
 * @type {RealDb}
 */
class RealDb {
    /**
     * Primary constructor. It tries to connect to the database, and then prints the outcome in the console.
     */
    constructor() {
        if (process.env.NODE_ENV !== 'test') {
            mongoose.connect(process.env.DB_ADDRESS)
                .then(() => { logSuccess(`Successfully connected to ${process.env.DB_ADDRESS}`) })
                .catch((e) => { console.error(e) });
        }
    }

    /**
     * Method that tries to find the <code>username</code> provided inside the DB
     * @param username - The username to find in the Database
     * @returns {Promise<{err: string}|{User}>} Returns a User object if found, an error if there isn't a correspondence
     */
    async findOneUser(username) {
        try {
            return (await User.findOne({ 'username': username }));
        } catch (e) {
            return e;
        }
    }
    /**
     * Method that tries to find the <code>whiteboardId</code> provided inside the DB
     * @param whiteboardId - The whiteboard to find in the Database
     * @returns {Promise<{err: string}|{Whiteboard}>} Returns a Whiteboard object if found, an error if there isn't a correspondence
     */
    async findOneWhiteboard(whiteboardId) {
        try {
            return (await Whiteboard.findById(whiteboardId));
        } catch (e) {
            return e;
        }
    }

    /**
     * Method to create and save a new given <code>user</code> on the DB.
     * @param user - The user object to save in the Database
     * @returns {Promise<{err: string}|{User}>} Returns a User object if found, an error if something went wrong
     */
    async createUser(user) {
        const toCreate = {
            username: user.username,
            password: user.password,
            first_name: user.first_name,
            last_name: user.last_name,
            notifications: []
        };
        try {
            return (await new User(toCreate).save());
        } catch (e) {
            return e;
        }
    }
    /**
     * Updates and save new given <code>newUsername</code>, <code>newFirstName</code> and <code>newLastName</code> for a specific <code>username</code>.
     * @param username - The current username used to find a corresponding object in the database.
     * @param newUsername - New username to update
     * @param newFirstName - New user's fisrt name
     * @param newLastName - New user's last name
     * @returns {Promise<{err: string}|{User}>} Returns the updated User object or an error if something went wrong        
     * */
    async updateUserInfo(username, newUsername, newFirstName, newLastName) {
        const user = await this.findOneUser(username);
        const alreadyExisting = await this.findOneUser(newUsername);
        if (user && (!alreadyExisting || (newUsername === username))) {
            return (await User.findByIdAndUpdate(user._id, { username: newUsername, first_name: newFirstName, last_name: newLastName },
                { returnDocument: 'after' }));
        }
        return null;
    }

    /**
     * Updates and save a new provided <code>password</code> for the specified <code>username</code>.
     * The password is first hashed and then updated.
     * @param username - The current username used to find a corresponding object in the database.
     * @param password - New password to save
     * @returns {Promise<{err: string}|{User}>} Returns the updated User object or an error if something went wrong        
     * */
    async updateUserPassword(username, password) {
        const user = await this.findOneUser(username);
        const hashedPassword = await bcrypt.hash(password, 10);
        if (user) {
            try {
                return (await User.findByIdAndUpdate(user._id, { password: hashedPassword },
                    { returnDocument: 'after' }));
            } catch (e) {
                return { err: e }
            }
        } else {
            return { err: "Username does not exists" }
        }
    }

    /**
     * Creates a new whiteboard with a specified <code>name</code> for the provided <code>username</code> as owner.
     * @param name - New whiteboard name
     * @param username - User owner of the whiteboard
     * @returns {Promise<{err: string}|{Whiteboard}>} Returns the new whiteboard object or an error if something went wrong        
     * */
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
            try {
                return (await new Whiteboard(toCreate).save());
            } catch (e) {
                console.log(e);
                return e;
            }
        }

    }

    /**
     * Updates the current name for the provided <code>whiteboardId</code> with a <code>newName</code>
     * @param whiteboardId - Whiteboard Id to find in the DB
     * @param newName - New name to update
     * @returns {Promise<{err: string}|{Whiteboard}>} Returns the new whiteboard object or an error if something went wrong        
     * */
    async updateWhiteboard(whiteboardId, newName) {
        try {
            return (await Whiteboard.findByIdAndUpdate(whiteboardId, { name: newName }));
        } catch (e) {
            console.error(e);
        }
    }
    /**
     * Deletes the specified <code>whiteboardId</code> from all the profiles
     * @param whiteboardId - Whiteboard Id to find and delete in the DB
     * @returns {Promise<{err: string}|{User}>} Returns a correct status or an error if something went wrong        
     * */
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

    /**
     * Generates a new lineId 
     * @param whiteboardId - Whiteboard Id to find in the DB
     * @returns {Promise<{err: string}|{User}>} Returns a correct status or an error if something went wrong        
     * */
    async generateFreshLineId(whiteboardId) {
        return (await new mongoose.Types.ObjectId());
    }

    /**
     * Insert a new line specified by <code>line</code> with a given <code>lineId</code> in the provided <code>whiteboardId</code>
     * @param whiteboardId - Whiteboard Id to find in the DB
     * @param lineId - New line id to insert in traits
     * @param line - set of points to insert
     * @returns {Promise<{err: string}|{Whiteboard}>} Returns a correct status or an error if something went wrong        
     * */
    async insertLine(whiteboardId, lineId, line) {
        try {
            const update = {}
            const string = `traits.${lineId}`;
            const trait = {}
            trait[string] = line;
            update["$set"] = trait;
            await Whiteboard.findOneAndUpdate({ _id: whiteboardId }, update);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Deletes the specified <code>lineId</code> of the selected <code>whiteboardId</code>
     * @param whiteboardId - Whiteboard Id to find in the DB
     * @param lineId - Line id to delete
     * @returns {Promise<{err: string}|{Whiteboard}>} Returns a correct status or an error if something went wrong        
     * */
    async deleteLine(whiteboardId, lineId) {
        const update = {}
        const string = `traits.${lineId}`;
        const trait = {}
        trait[string] = 1;
        update["$unset"] = trait;
        await Whiteboard.findOneAndUpdate({ _id: whiteboardId }, update);
    }

    /**
     * Insert a new user in the list of a specified <code>whiteboardId</code>
     * @param whiteboardId - Whiteboard Id to find in the DB
     * @param username - Username used to find an existing User to add
     * @returns {Promise<{err: string}|{Whiteboard}>} Returns a correct status or an error if something went wrong        
     * */
    async inviteUserToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        const whiteboard = await this.findOneWhiteboard(whiteboardId);
        if (!whiteboard.users.includes(user.id)) {
            await Whiteboard.findByIdAndUpdate(whiteboardId, { $push: { users: user._id } })
        }
    }
    /**
     * Checks if the given <code>username</code> is allowed to access the provided <code>whiteboardId</code>
     * @param whiteboardId - Whiteboard Id to find in the DB
     * @param username - Username used to find an existing User to check
     * @returns {Promise<{err: string}|{boolean}>} Returns a correct status or an error if something went wrong        
     * */
    async validateUserToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        if (user) {
            const whiteboard = (await Whiteboard.findById(whiteboardId));
            return whiteboard.users.includes(user._id)
        }
    }
    /**
    * Checks if the given <code>username</code> is the owner of the provided <code>whiteboardId</code>
    * @param whiteboardId - Whiteboard Id to find in the DB
    * @param username - Username used to find an existing User to check
    * @returns {Promise<{err: string}|{boolean}>} Returns a correct status or an error if something went wrong        
    * */
    async validateOwnerToWhiteboard(username, whiteboardId) {
        const user = await this.findOneUser(username);
        const whiteboard = await this.findOneWhiteboard(whiteboardId);
        if (user && whiteboard) {
            return user._id.equals(whiteboard.ownerId);
        }
    }

    /**
    * Get every whiteboard associated with the <code>username</code> provided, both if owner or shared.
    * @param username - Username used to find an existing User to check
    * @returns {Promise<{err: string}|{Whiteboard}>} Returns a correct status or an error if something went wrong        
    * */
    async getWhiteboards(username) {
        const user = await this.findOneUser(username);
        if (user !== undefined) {
            try {
                return (await Whiteboard.find({ users: { $in: [user._id] } }));
            } catch (e) {
                console.error(e);
            }
        }
    }

    /**
    * Get every user who satisfies a given <code>filter</code>.
    * @param filters - Filters 
    * @returns {Promise<{err: string}|{Users[]}>} Returns a list of users or an error if something went wrong        
    * */
    async getUsersWithFilters(filters) {
        const LIMIT = 20;
        if (filters) {
            const out = [];
            const word = filters.username
            const users = await (User.find({
                "$and": [{
                    first_name: {
                        "$regex": word,
                        "$options": "i"
                    }
                }, { first_name: { "$ne": filters.excludes } }]
            }));
            const usersAlreadyIn = (await Whiteboard.findById(filters.whiteboardId).select("users").lean()).users;
            for (let i = 0; i < users.length && i < LIMIT; i++) {
                const user = users[i];
                out.push({
                    id: user._id, username: user.username, first_name: user.first_name, last_name: user.last_name,
                    alreadyIn: checkContains(usersAlreadyIn, user._id)
                });
            }
            return { users: out };
        } else {
            return (await User.find({ notifications: {} }));
        }
    }

    /**
    * Get every notification associated to the given <code>username</code>.
    * @param username - Username used to find an existing User to check
    * @returns {Promise<{err: string}|{Notification[]}>} Return a list of notification or an error if something went wrong       
    * */
    async getNotificationOfUser(username) {
        const user = await this.findOneUser(username);
        if (user !== undefined) {
            try {
                return (await Notification.find({ user: user._id }));
            } catch (e) {
                console.error(e);
            }
        }

    }

    /**
    * Push the provided <code>notification</code> to the existing list of a given <code>username</code>
    * @param username - Username used to find an existing User to check
    * @param notification - Notification object to add
    * @returns {Promise<{err: string}|{Notification[]}>} Return a correct status or an error if something went wrong       
    * */
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

    /**
    * Deletes the provided <code>notificationId</code> from the existing list of a given <code>username</code>
    * @param username - Username used to find an existing User to check
    * @param notificationId - Notification id to find and delete
    * @returns {Promise<{err: string}|{Notification[]}>} Return a correct status or an error if something went wrong       
    * */
    async deleteNotification(notificationId, username) {
        try {
            const notification = await Notification.findById(notificationId)
            const user = this.findOneUser(username)
            // remove the notification from all the profiles
            if (notification && user) {
                return await Notification.findByIdAndDelete(notificationId);
            }
        } catch (e) {
            return { err: e }
        }
    }

    /**
    * Updates the provided <code>notificationId</code> 
    * @param notificationId - Notification id to find and update
    * @returns {Promise<{err: string}|{Notification[]}>} Return a correct status or an error if something went wrong       
    * */
    async updateNotification(notificationId) {
        try {
            const notification = await Notification.findById(notificationId)
            // check if exist firts
            if (notification) {
                await Notification.findByIdAndUpdate(notification._id, { visualized: true });
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
    * Gets the list of unread notifications for the provided <code>username</code>.
    * @param username - Username used to find an existing User to check
    * @returns {Promise<{Notification[]}>} Return the list of unread notifications. 
    * */
    async getUnreadNotificationNumber(username) {
        const user = await this.findOneUser(username);
        return (await Notification.count({ visualized: false, user: user._id }));

    }

}
exports.Model = new RealDb();