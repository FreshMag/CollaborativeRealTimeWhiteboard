const {Server} = require('socket.io')
const {logYellow, log, logErr, logCyan, logConnected, logSuccess, logExited, logDisconnected, logJoinedApp} = require("../../util/consoleUtil");


const LogType = {
    ERR: logErr,
    JOIN_APP: logJoinedApp,
    JOIN_WHITEBOARD: logSuccess,
    EXIT_APP: logExited,
    EXIT_WHITEBOARD: logYellow,
    INVITE: logCyan,
    CONNECTED: logConnected,
    DISCONNECT: logDisconnected
}


exports.Realtime = class Realtime {
    constructor(server, controller) {
        // Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
        this.io = new Server(server, {
            cors: {
                origin: ['http://localhost:3000', "http://localhost:8080"],
                methods: ['GET', 'POST'],
            },
        });
        this.controller = controller;
        this.roomData = {users: {}, connections: {}, rooms: {}, usersInWhiteboard: {}};
        this.applicationData = {};

    }

    log(message, logType) {
        logType(message);
    }

    listen() {

        // Listen for when the client connects via socket.io-client
        this.io.on('connection', (socket) => {
            if (socket.handshake.query.accessToken) {
                this.log(`${socket.id} has connected through socket.IO`, LogType.CONNECTED)
                socket.on("joinApplication", (accessToken, callback) => {
                    this.controller.checkToken(accessToken, (err, result) => {
                        if(err){
                            // todo manage unauthorized access
                            this.log("Error connecting: " + err, LogType.ERR)
                            callback({status: 'ko'});
                            socket.disconnect();
                        } else{
                            this.joinApplication(socket, result.username);
                            callback({status: 'ok'});
                        }
                    })
                })

                socket.on("disconnectApplication", (accessToken) => {
                    this.controller.checkToken(accessToken, (err, result) => {
                        if (err) {
                            // todo manage unauthorized access
                            this.log("Error connecting: " + err, LogType.ERR)
                        } else {
                            delete this.applicationData[result.username];
                            //socket.disconnect();
                            this.log(result.username + " has left the application", LogType.EXIT_APP);
                            socket.removeAllListeners("joinWhiteboard")
                        }
                    })
                })

                // Listen for when the client disconnects
                socket.on('disconnect', () => {
                    this.log(socket.id + " has disconnected", LogType.DISCONNECT);
                    socket.removeAllListeners();
                });

            } else {
                this.log("Missing access token in the connection query", LogType.ERR);
            }
        });
    }

    joinApplication(socket, username) {
        this.applicationData[username] = socket;
        this.log(`${username} has connected to the application. Socket ID : ${socket.id}`, LogType.JOIN_APP);

        socket.on('inviteCollaborator', (accessToken, toInviteUsername) =>{
            this.controller.checkToken(accessToken, (err, result) =>{
                if(err){
                    // todo manage unauthorized access
                    this.log("Error connecting: " + err, LogType.ERR)
                    socket.disconnect();
                } else{
                    //todo add notification to db
                    this.log(`${username} has invited ${toInviteUsername} to the application. Socket ID : ${socket.id}`, LogType.INVITE);
                    this.applicationData[toInviteUsername]?.emit('receiveCollaborationInvite', (result.username));
                }
            })
        })
        socket.on("joinWhiteboard", (accessToken, whiteboardId, callback)=> {
            const room = whiteboardId;
            // get the user ID from the connection query and assign that user to the correct room (whiteboard)
            // the room is also get from the connection query
            this.controller.joinWhiteboard(accessToken, room,
                (err, username) => {
                    if (err) {
                        // todo manage unauthorized access
                        this.log("Error connecting: " + err, LogType.ERR)
                        callback({status: "ko"})
                        socket.disconnect();
                    } else if (username) {
                        this.joinWhiteboard(socket, username, room);
                        callback({status:'ok'});
                    } else {
                        // todo manage internal server error
                        this.log("Internal server error", LogType.ERR)
                    }


                })

        });
    }

    joinWhiteboard(socket, username, room) {

        socket.join(room);
        this.log(`${username} has connected to whiteboard`, LogType.JOIN_WHITEBOARD);

        this.roomData.users[username] = room;
        this.roomData.connections[username] = socket.id;

        // create a list of all the connections' IDs related to this room
        if (this.roomData.rooms[room]) {
            this.roomData.usersInWhiteboard[room].push(username);
            this.roomData.rooms[room].push(socket);
        } else {
            this.roomData.usersInWhiteboard[room] = [username];
            this.roomData.rooms[room] = [socket];
        }

        this.roomData.rooms[room].forEach(connection => {
            if(socket.id !== connection.id){
                connection.emit("user-connected", username);
            }
        })

        socket.emit('allConnectedUsers', this.roomData.usersInWhiteboard[room]);

        //this.io.sockets.in(room).emit('welcome', `${username} has joined the Whiteboard!`);

        socket.on('drawStart', (line, accessToken, callback) => {
            this.controller.lineStarted(line, accessToken, room, (err, newId) => {
                if (err) {
                    // todo handle unauthorized line
                } else {
                    callback({newId: newId}); // to propagate back to the client the fresh new line id
                    //console.log(line);
                    //console.log(newId);
                    this.roomData.rooms[room].forEach(connection => {
                        if(socket.id !== connection.id){
                            connection.emit("drawStartBC", line, newId);
                        }
                    })
                }
            })
        })


        socket.on('drawing', (line, lineId, accessToken) => {
            this.controller.lineMove(line, lineId, room, (err) => {
                if (!err) {
                    this.roomData.rooms[room].forEach(connection => {
                        if(socket.id !== connection.id){
                            connection.emit("drawingBC", line, lineId);
                        }
                    })
                } else {
                    // todo handle error
                }
            })

        })

        socket.on('drawEnd', (line, lineId, accessToken) => {
            this.controller.lineEnd(line, accessToken, lineId, room, (err) => {
                if (err) {
                    // todo handle unauthorized line
                } else {
                    this.roomData.rooms[room].forEach(connection => {
                        if(socket.id !== connection.id){
                            connection.emit("drawEndBC", line, lineId);
                        }
                    })
                }
            })

        })

        socket.on('lineDelete', (lineId, accessToken) => {
            this.controller.lineDelete(lineId, accessToken, room, (err) => {
                if (err) {
                    // todo handle unauthorized line
                } else {
                    this.roomData.rooms[room].forEach(connection => {
                        if(socket.id !== connection.id){
                            connection.emit("lineDeleteBC", lineId);
                        }
                    })
                }
            })

        })

        const leftListener = () => {
            this.log(username + " has disconnected from the whiteboard", LogType.EXIT_WHITEBOARD);
            this.roomData.rooms[room] = this.roomData.rooms[room].filter(connection => connection.id !== socket.id);
            this.roomData.usersInWhiteboard[room] = this.roomData.usersInWhiteboard[room].filter(user => user !== username);
            this.roomData.rooms[room].forEach(connection => {
                if(socket.id !== connection.id){
                    connection.emit("user-disconnected", username);
                }
            })
            socket.removeAllListeners("drawStart");
            socket.removeAllListeners("getAllConnectedUsers");
            socket.removeAllListeners("drawing");
            socket.removeAllListeners("drawEnd");
            socket.removeAllListeners("leftWhiteboard");
            socket.removeAllListeners("lineDelete");
            socket.off("disconnect", leftListener);
            socket.off("disconnectApplication", leftListener);
            //todo implementare l'aggiornamento di roomData
        };


        // Listen for when the client disconnects
        socket.on('leftWhiteboard',leftListener);
        socket.on('disconnectApplication', leftListener)
        socket.on('disconnect', leftListener);
    }

}