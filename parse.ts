// Given data
const data = "2424008f142170323182ff99553039303030372e3030302c412c313431302e393830332c4e2c31303033342e303435382c452c302e30302c3232312c3136303332342c2c2a30337c312e307c31327c323430307c303030302c303030302c303130372c303239457c30323038303030303042424430313435353731357c30437c30323433343241437c303973c60d0a";
// const data = "24240090142170323182ff9999033130343433312e3030302c412c313431302e393832342c4e2c31303033342e303434392c452c302e30302c3233352c3136303332342c2c2a30457c302e387c31337c323430307c303030302c303030302c303131302c303241447c30323038303030303042424430313435303535337c30447c30323433343146327c3041381f0d0a";

function parseGPSData(data) {
    // Extracting components based on lengths and positions
    const L = data.substr(4, 4); // Assuming L is 008f
    const ID = data.substr(8, 14); // Assuming ID is 1421703
    const command = data.substr(22, 4); // Assuming command is 2318

    console.log("command: ", command);
    
    let fData = {};

    if(command == "9955" || command == "9999"){
        let dataPart = "";
        let pData = "";

        if(command == "9955"){
            // Calculate the maximum possible length for the data part
            const maxDataLength = data.length - 38; // 34 is the sum of lengths of L, ID, and command fields
            // Extract the data part, ensuring not to exceed its maximum length
            let dataPart = data.substr(26, maxDataLength);

            // Check if the data part ends with the checksum; if not, adjust its length accordingly
            const checksumIndex = dataPart.lastIndexOf("|*");
            if (checksumIndex !== -1) {
                dataPart = dataPart.substr(0, checksumIndex);
            }

            // Extract the checksum
            const checksum = data.substr(data.length - 8, 4); // Assuming checksum is c60d

            // Replace hexadecimal characters `0d0a` with \r\n in the data part
            dataPart = dataPart.replace(/0d0a/g, "\r\n");

            // parse first part
            pData = Buffer.from(dataPart, 'hex').toString('utf-8').split("|");

        } 
        
        if(command == "9999"){

            fData.alarmCode = data.substr(26, 2); 
            // Calculate the maximum possible length for the data part
            const maxDataLength = data.length - 40; // 34 is the sum of lengths of L, ID, and command fields
            // Extract the data part, ensuring not to exceed its maximum length
            dataPart = data.substr(28, maxDataLength);

            // Check if the data part ends with the checksum; if not, adjust its length accordingly
            const checksumIndex = dataPart.lastIndexOf("|*");
            if (checksumIndex !== -1) {
                dataPart = dataPart.substr(0, checksumIndex);
            }

            // Extract the checksum
            const checksum = data.substr(data.length - 8, 4); // Assuming checksum is c60d

            // Replace hexadecimal characters `0d0a` with \r\n in the data part
            dataPart = dataPart.replace(/0d0a/g, "\r\n");

            // parse first part
            pData = Buffer.from(dataPart, 'hex').toString('utf-8').split("|");
        }
        console.log(pData);
        
        fData.imei = ID.replace("ff", "");
        fData.command = command;
        fData.time = formatTime(pData[0].split(",")[0]);
        fData.gpsStatus = pData[0].split(",")[1];
        fData.latitude = latitudeToDecimal(pData[0].split(",")[2]);
        fData.northSouth = pData[0].split(",")[3];
        fData.longitude = longitudeToDecimal(pData[0].split(",")[4]);
        fData.eastWest = pData[0].split(",")[5];
        fData.speed = pData[0].split(",")[6];
        fData.heading = pData[0].split(",")[7];
        fData.date = textToDate(pData[0].split(",")[8]);
        fData.magneticVar = pData[0].split(",")[9];
        fData.gprmc = pData[0].split(",")[10];
        fData.hdop = pData[1];
        fData.altitude = pData[2];
        fData.state = parseInt(pData[3], 16).toString(2);
        // fData.ad = pData[4];
        fData.ad1 = (hexToDecimal(pData[4].split(",")[0])/1024)*6;
        fData.ad2 = (hexToDecimal(pData[4].split(",")[1])/1024)*24;
        fData.extBat = (hexToDecimal(pData[4].split(",")[2])/1024)*48;
        fData.intBat = (hexToDecimal(pData[4].split(",")[3])/1024)*6;
        fData.baseID = pData[5];
        fData.csq = hexToDecimal(pData[6]);
        fData.mileague = hexToDecimal(pData[7]);
        fData.satellite = hexToDecimal(pData[8]) || '';
        fData.customData = pData[9] || "";
    }
    return fData;
}
module.exports = parseGPSData;

function latitudeToDecimal(latitude) {
    // Extract degrees and minutes parts
    const degrees = parseFloat(latitude.substr(0, 2));
    const minutes = parseFloat(latitude.substr(2));

    // Calculate decimal degrees
    const decimalDegrees = degrees + minutes / 60;

    return decimalDegrees;
}

function textToDate(textDate) {
    // Parse the day, month, and year components from the text string
    const day = parseInt(textDate.substr(0, 2));
    const month = parseInt(textDate.substr(2, 2)); // Months are zero-based in JavaScript Date objects
    const year = 2000 + parseInt(textDate.substr(4, 2)); // Assuming year 2000+

    // Create a new Date object
    const date = year + "/" + month + "/" + day;

    return date;
}

function longitudeToDecimal(longitude) {
    // Extract degrees and minutes parts
    const degrees = parseFloat(longitude.substr(0, 3));
    const minutes = parseFloat(longitude.substr(3));

    // Calculate decimal degrees
    const decimalDegrees = degrees + minutes / 60;

    return decimalDegrees;
}

function hexToDecimal(hexString) {
    // Parse the hexadecimal string to decimal
    const decimalValue = parseInt(hexString, 16);
    
    return decimalValue;
}

function removeUnseenCharacters(inputString) {
    // Define a regular expression to match unseen characters
    const unseenRegex = /[\x00-\x1F\x7F-\x9F]/g;

    // Remove unseen characters using the regular expression
    const cleanedString = inputString.replace(unseenRegex, '');

    return cleanedString;
}

function formatTime(timeString) {
    // Parse hours, minutes, seconds, and milliseconds
    
    const hours = parseInt(timeString.substr(0, 2));
    const minutes = parseInt(timeString.substr(2, 2));
    const seconds = parseInt(timeString.substr(4, 2));
    const milliseconds = parseInt(timeString.substr(7, 3));

    // Create a new Date object with the parsed time components
    const time = new Date(0);
    time.setUTCHours(hours);
    time.setUTCMinutes(minutes);
    time.setUTCSeconds(seconds);
    time.setUTCMilliseconds(milliseconds);

    // Format the time as "HH:MM:SS.fff"
    return time.toISOString().substr(11, 12); // HH:MM:SS.fff
}