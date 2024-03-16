function calculateCRC(hexData) {
    // Convert hex data string to array of bytes
    const bytes = hexData.match(/[0-9A-Fa-f]{2}/g).map(byte => parseInt(byte, 16));

    let crc = 0xFFFF; // Initial CRC value

    for (let i = 0; i < bytes.length; i++) {
        crc ^= (bytes[i] << 8); // XOR CRC with next byte
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) { // Check if leftmost bit is 1
                crc = (crc << 1) ^ 0x1021; // If yes, shift left and XOR with polynomial
            } else {
                crc <<= 1; // If no, just shift left
            }
            crc &= 0xFFFF; // Ensure CRC remains 16-bit
        }
    }
    const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
    console.log(crcHex);
    
    return crcHex;
}

calculateCRC("40 40 00 12 14 21 70 32 31 82 FF 41 14 00");

module.exports = calculateCRC;