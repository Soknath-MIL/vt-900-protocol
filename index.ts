const net = require("net");

// Create a TCP server
const server = net.createServer((socket) => {
  // Connection event
  console.log("Client connected");

  // Handle data from the client
  socket.on("data", (data) => {
    console.log(`Received from client: ${data}`);
    // Echo data back to client
    socket.write(`Server received: ${data}`);
  });

  // Handle client disconnect
  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

// Listen for connections on port 3000
server.listen(10803, () => {
  console.log("Server listening on port 10803");
});
