const WebSocket = require("ws");

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Event listener for connection
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Event listener for receiving messages from clients
  ws.on("message", (message) => {
    console.log("Received message:", message);

    // Echo the received message back to the client
    ws.send(message);
  });

  // Event listener for disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
