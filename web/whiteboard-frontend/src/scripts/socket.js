import { io } from "socket.io-client";

/**
 * URL of the Socket.IO server
 * @type {string}
 */
const URL = `http://${process.env.VUE_APP_BACKEND_IP}`;
/**
 * Access Token provided to connect to the Socket.IO application
 * @type {string}
 */
const accessToken = localStorage.getItem("accessToken");
/**
 * Socket object created once connecting to Socket.IO server. This is used by other components to handle Socket.IO
 * connections.
 * @type {Socket}
 */
export const socket = io(URL, {query: {
        "accessToken": accessToken,
}});


