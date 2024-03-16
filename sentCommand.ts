const net = require('net');

// Define the TCP server parameters
const deviceHost = '223.24.190.215'; // Replace 'device_ip_address' with the actual IP address of the device
const devicePort = 10803; // Replace 12345 with the actual port number of the device

// Define the command to send back to the device as a buffer
const commandToSend = Buffer.from('40400012142170323182FF41140163420D0A'.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));


// Create a TCP client and connect to the device
const client = net.createConnection({ host: deviceHost, port: devicePort }, () => {
    console.log('Connected to device');
    
    // Send the command back to the device
    // let checksum = calculateCRC(commandToSend)
    client.write(commandToSend);

});

// Handle data received from the device (optional)
client.on('data', (data) => {
    console.log('Received data from device:', data.toString());
});

// Handle connection close event (optional)
client.on('close', () => {
    console.log('Connection to device closed');
});

// Handle connection error event (optional)
client.on('error', (err) => {
    console.error('Connection error:', err);
});
