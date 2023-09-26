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
const filePath = 'Telegram2.txt'; // Replace with your file
const content = readFileContent(filePath);
const lines = parseFileContent(content);
// prefix for station
const prefix = 'ГРП';
const objects = createArrayOfObjects(lines, prefix);
const sortedArray = sortArrayOfObjectsByDate(objects);

const runTask = () => {
    console.log('Running your task...');
    // Put your task logic here 
    sendMessages(bot, process.env.CHAT_ID, sortedArray);
  };
  
  // Watch for file changes and run the task
watchFile(filePath, runTask);

// console.log("ENV", process.env);