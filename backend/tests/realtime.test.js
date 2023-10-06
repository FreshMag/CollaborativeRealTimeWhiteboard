const ioc = require("socket.io-client");
const Realtime = require('../src/realtime/api/Realtime');
const whiteboardController = require("../src/controllers/whiteboardController");
const http = require("http");

describe("Realtime Test", () => {
    let clientSocket;

    beforeAll((done) => {
        const server = http.createServer();
        const rt = new Realtime(server, whiteboardController);
        rt.listen();
        server.listen(4000, () => {
            clientSocket = ioc(`http://localhost:4000`);
            clientSocket.on("connect", done);
        });
    });

    afterAll(() => {
        clientSocket.disconnect();
    });

    test("should be connected", () => {
        expect(clientSocket.connected).toBe(true);
    });

});