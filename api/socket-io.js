const { attachHearth, createHttpServer } = require("../server");

const server = createHttpServer();
attachHearth(server, { socketPath: "/api/socket-io/socket.io" });

module.exports = server;
