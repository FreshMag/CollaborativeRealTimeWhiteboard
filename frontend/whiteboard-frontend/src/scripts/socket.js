import { io } from "socket.io-client";

export let connected = false;

// "undefined" means the URL will be computed from the `window.location` object
const URL = `http://${process.env.VUE_APP_BACKEND_IP}`;
const accessToken = localStorage.getItem("accessToken");
export const socket = io(URL, {query: {
        "accessToken": accessToken,
}});


