import fs from 'node:fs';
import iconv from 'iconv-lite';
import chardet from 'chardet';

const detectEncoding = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'binary');
      const detectedBuffer = Buffer.from(content, 'binary');
      const encoding = chardet.detect(detectedBuffer);
      return encoding;
    } catch (error) {
      console.error(`Error detecting encoding for ${filePath}:`, error);
      return null;
    }
};

const filePath = './Telegram_280923.txt'; // Replace with your file
const sourceEncoding = 'utf8';

const convertFromBuf = () => {
    let buf = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f]);

    // Convert from a js string to an encoded buffer.
    buf = iconv.encode("Пример строки преобразованной в буфер", "utf8");
    fs.appendFile("temp.txt", buf, { encoding: "ascii" }, (err) => {
      if (!err) console.log("Записано buf ", buf);
    });
    console.log("file start read");
    // fs.readFile(filePath, (err, data) => {
    //     if(err) throw err;
    //     // console.log("data", data);
    //     const utf8Content = iconv.encode(data, "utf8");
    //     console.log("encode ", utf8Content);
    //     fs.writeFile("tempFile.txt", utf8Content, { encoding: "ascii" }, (err) => {
    //        if (err) console.log("Записано file");
    //     });
    // })
    // Convert encoding streaming example
fs.createReadStream(filePath)
  .pipe(iconv.decodeStream("utf16"))
//   .pipe(iconv.decodeStream("win1251"))
//   .pipe(iconv.decodeStream("ascii"))
//   .pipe(iconv.encodeStream("utf8"))
  .pipe(fs.createWriteStream("file-in-utf8.txt"));
    // const content = fs.readFile(filePath, { encoding: "utf8"});
    
}


const convertToUTF8 = (sourcePath, sourceEncoding, targetPath) => {
    try {
      const content = fs.readFileSync(sourcePath, { encoding: sourceEncoding });
      const utf8Content = iconv.encode(iconv.decode(content, sourceEncoding), 'utf-8');
      fs.writeFileSync(targetPath, utf8Content);
      console.log(`File successfully converted to UTF-8: ${targetPath}`);
    } catch (error) {
      console.error(`Error converting file to UTF-8: ${sourcePath}`, error);
    }
  };

export { convertToUTF8, convertFromBuf }
  