const fs = require('fs');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('webhook-debug.log', logMessage);
}

// Test if this works
logToFile('Webhook debug logger initialized');

module.exports = { logToFile };