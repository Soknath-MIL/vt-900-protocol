const net = require("net");
const express = require("express");
const parseGPSData = require("./parse.ts");

const bodyParser = require('body-parser')

// Define the command to send back to the device as a buffer
// Create a TCP server
const server = net.createServer((socket) => {
  // Connection event
  console.log("Client connected");

  // Handle data from the client
  socket.on("data", (rawData) => {

    const clientIP = socket.remoteAddress;
    console.log("Data received from client at IP:", clientIP);

    // Log received data as a Buffer (binary)
    console.log("Received from client (as Buffer):", rawData);

    // Convert the data to a string if it's textual
    const receivedText = rawData.toString('hex');
    console.log("Received from client (as string):", receivedText);
    let parseData = parseGPSData(receivedText);
    console.log(parseData);
    
    // send to strapi
  
  });

  // Create Express app
  const app = express();
  const port = 4001;
  // create application/json parser
  var jsonParser = bodyParser.json()

  // Define API endpoint to send command
  app.post("/send-command", jsonParser, (req, res) => {
    
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }
    
    // 40400012142170323182FF41140163420D0A
    // 40400012142170323182FF41140073630D0A 
    const commandToSend = Buffer.from(command.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    socket.write(commandToSend);
    res.json({ message: `Command "${command}" sent to client` });
  });

  // Start Express server
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
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
