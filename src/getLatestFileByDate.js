import fs from 'node:fs';

const getLatestFileByDate = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);
  const validFiles = files.filter(file => file.match(/^Telegram\d{6}\.txt$/));
  
  if (!validFiles.length) {
    console.error('No valid files found.');
    return null;
  }
  
  // Sort files based on the date in the file name
  validFiles.sort((a, b) => {
    const dateA = new Date(a.slice(7, 13));
    const dateB = new Date(b.slice(7, 13));
    return dateB - dateA;
  });
  
  return validFiles[0];
};

export default getLatestFileByDate;
