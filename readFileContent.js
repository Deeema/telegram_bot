import fs from 'node:fs';

const readFileContent = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading the file:', error);
    return null;
  }
};

export { readFileContent };