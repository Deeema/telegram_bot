import { readFileContent } from "./readFileContent.js";
import { parseFileContent } from "./parseFileContent.js";
import { createArrayOfObjects } from "./createArrayOfObjects.js";
import { sortArrayOfObjectsByDate } from "./sortArrayOfObjectsByDate.js";
import { sendMessages } from "./sendMessages.js";
import TelegramBot from 'node-telegram-bot-api';

const token = '6598623475:AAEmdP5Qpz601hRaFku1k4CYMZ3XDkHx5zU'; // Replace with your Telegram bot token
const chatId = '417249119'; // Replace with your chat ID or the chat ID of the recipient

const bot = new TelegramBot(token, { polling: false });
const filePath = 'Telegram.txt'; // Replace with your file
const content = readFileContent(filePath);
const lines = parseFileContent(content);
// prefix for station
const prefix = 'PS-';
const objects = createArrayOfObjects(lines, prefix);
const sortedArray = sortArrayOfObjectsByDate(objects);

sendMessages(bot, chatId, sortedArray);

// console.log("content", sortedArray);