import fetch from 'node-fetch';
import 'dotenv/config';
import db from './db/database.js';

let lastProcessedEventId = 0;

const sendTelegramMessage = async (message) => {
  const telegramBotToken = `${process.env.TOKEN}`; //'YOUR_TELEGRAM_BOT_TOKEN'
  const chatId = `${process.env.CHAT_ID}`;         // 'YOUR_TELEGRAM_CHANNEL_ID'
  const apiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  const data = await response.json();
  console.log('Message sent to Telegram:', data);
};

// const monitorNewEvents = () => {
//   const sqlQuery = 'SELECT * FROM events WHERE id > ?';
  
//   db.all(sqlQuery, [lastProcessedEventId], (err, rows) => {
//     if (err) {
//       throw err;
//     }

//     rows.forEach(row => {
//       const message = `New event: ${row.event_name} at ${row.event_time}`;
//       sendTelegramMessage(message);
//     });

//     if (rows.length > 0) {
//       lastProcessedEventId = rows[rows.length - 1].id;
//     }
//   });
// };

// Monitor for new events every 5 seconds (adjust as needed)
// setInterval(monitorNewEvents, 5000);

export { sendTelegramMessage };

// Close the database connection when exiting
// process.on('SIGINT', () => {
//   console.log('Closing the database connection.');
//   db.close((err) => {
//     if (err) {
//       console.error('Error closing database:', err.message);
//     } else {
//       console.log('Database closed.');
//     }
//     process.exit(0);
//   });
// });
