import fs from 'node:fs';

const loadFlags = (filePath) => {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return an empty object if the file doesn't exist or cannot be read
      return {};
    }
};  

const updateFlags = (filePath, flags) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(flags, null, 2));
      console.log('Flags updated and saved successfully.');
    } catch (error) {
      console.error('Error updating and saving flags:', error);
    }
};
  



const sendMessages = (bot, chatId, sortedArray) => {
 // Load previous flags or initialize an empty object
let flags = loadFlags('flags.json');

// Update sortedArray with flags from flags.json
sortedArray.forEach(element => {
  const sensorName = element.name;

  // Check if the sensor has flags
  if (flags[sensorName]) {
    const dates = Object.keys(flags[sensorName]);

    // Update flags for each date in sortedArray
    dates.forEach(date => {
      const foundDateIndex = sortedArray.findIndex(item => item.name === sensorName && item.date === date);

      if (foundDateIndex !== -1) {
        sortedArray[foundDateIndex].sent = flags[sensorName][date].sent;
        sortedArray[foundDateIndex].read = flags[sensorName][date].read;
      }
    });
  }
});

// Update the flags and save them
// 
// Update the flags and save them
sortedArray.forEach(element => {
  const sensorName = element.name;

  if (!element.sent) {
    const formattedData = element.data.join('\n');  // Format data to string with new lines
    bot.sendMessage(chatId, `${element.name} \n${element.date} \n${formattedData}`);
    element.sent = true;  // Update the sent flag

    // Create flags for each date if not already present
    if (!flags[sensorName]) {
      flags[sensorName] = {};
    }

    // Update the sent flag for this date
    flags[sensorName][element.date] = { sent: true, read: false };
  }

  // Mark as read
  element.read = true;
  flags[sensorName][element.date].read = true;
});

// Save the updated flags
updateFlags('flags.json', flags);

}

  
export { sendMessages };