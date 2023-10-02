import { readFileContent } from "./src/readFileContent.js";
import { parseFileContent } from "./src/parseFileContent.js";
import { createArrayOfObjects } from "./src/createArrayOfObjects.js";
import { sortArrayOfObjectsByDate } from "./src/sortArrayOfObjectsByDate.js";
import { sendMessages } from "./src/sendMessages.js";
import { watchFile } from "./src/watchFile.js";
import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config'
import cron from 'node-cron';

const bot = new TelegramBot(process.env.TOKEN, { polling: false });
const fileDirectory = process.env.FILE_DIRECTORY;
const filePath = 'Telegram270923.txt'; // Replace with your file

// Function to run the task
const runTask = () => {
    console.log('Running your task...');
    // TODO - change flags to dateresponse
    const latestFile = getLatestFileByDate(fileDirectory);
    // Put your task logic here 
    if (latestFile) {
        const content = readFileContent(latestFile);
        const lines = parseFileContent(content);
        const prefix = process.env.PREFIX;
        const objects = createArrayOfObjects(lines, prefix);
        const sortedArray = sortArrayOfObjectsByDate(objects);
        sendMessages(bot, process.env.CHAT_ID, sortedArray);
    }
};

let count = 0;

// Schedule the task every 2 minutes
cron.schedule('*/2 * * * *', () => {
    count++;
    console.log(`Running a task every 2 minutes. Date ${new Date()} ${count}`);
    // runTask();
    // Watch for file changes and run the task
    watchFile(filePath, runTask);
});

// Watch for file changes and run the task
// watchFile(filePath, runTask);

