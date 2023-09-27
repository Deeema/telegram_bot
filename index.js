import { readFileContent } from "./src/readFileContent.js";
import { parseFileContent } from "./src/parseFileContent.js";
import { createArrayOfObjects } from "./src/createArrayOfObjects.js";
import { sortArrayOfObjectsByDate } from "./src/sortArrayOfObjectsByDate.js";
import { sendMessages } from "./src/sendMessages.js";
import { watchFile } from "./src/watchFile.js";
import getLatestFileByDate from './src/getLatestFileByDate.js';
import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config'
import cron from 'node-cron';

const bot = new TelegramBot(process.env.TOKEN, { polling: false });
// Get the latest file based on date
const latestFile = getLatestFileByDate(process.env.FILE_DIRECORY);
const filePath = `${latestFile}`;
// const filePath = 'Telegram2.txt'; // Replace with your file

// Function to run the task
const runTask = () => {
    console.log('Running your task...');
    // Put your task logic here 
    if (latestFile) {
        console.log(`Reading content from the latest file: ${filePath}`);
        const content = readFileContent(latestFile);
        const lines = parseFileContent(content);
        const prefix = 'ГРП';
        const objects = createArrayOfObjects(lines, prefix);
        const sortedArray = sortArrayOfObjectsByDate(objects);
        sendMessages(bot, process.env.CHAT_ID, sortedArray);
    };
};

let count = 0;

// Schedule the task every 2 minutes
cron.schedule('*/2 * * * *', () => {
    count++;
    console.log(`Running a task every 2 minutes. Date ${new Date()} ${count}`);
    runTask();
});

// Watch for file changes and run the task
watchFile(filePath, runTask);
