const os = require("os");

function lanAddresses() {
  const nets = os.networkInterfaces();
  const found = [];
  for (const list of Object.values(nets)) {
    for (const net of list || []) {
      const family = net.family === "IPv4" || net.family === 4;
      if (family && !net.internal) found.push(net.address);
    }
  }
  return found;
}

function localUrls(port) {
  const lan = lanAddresses();
  return {
    port,
    local: `http://127.0.0.1:${port}`,
    lan: lan.map((ip) => `http://${ip}:${port}`),
  };
}

module.exports = { lanAddresses, localUrls };
