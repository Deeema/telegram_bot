import fs from 'node:fs';

const watchFile = (filePath, callback) => {
    fs.watch(filePath, (event, filename) => {
      if (event === 'change') {
        console.log(`File ${filename} has changed.`);
        callback();
      }
    });
};

export { watchFile };