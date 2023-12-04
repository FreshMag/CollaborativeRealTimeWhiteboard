const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    first_name: String,
    last_name: String,
})

const whiteboardSchema = new mongoose.Schema({
    name: String,
    ownerId: Object,
    traits: Object,
    freeId: Number,
    users: [Object]
})

const notificationSchema = new mongoose.Schema({
    body: String,
    visualized: Boolean,
    type: String,
    time : { type : Date, default: Date.now },
    user: Object
})

module.exports.User = mongoose.model('User', userSchema);
module.exports.Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);
module.exports.Notification = mongoose.model('Notification', notificationSchema);
