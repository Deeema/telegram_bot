import { watchForNewCensorRecords } from './src/db/events.js';
import { sendTelegramMessage } from './src/sendTelegramMessage.js';
import { getColumnNames } from './src/db/getColumnNames.js';
import db from './src/db/database.js';

import dotenv from 'dotenv';
dotenv.config();

const insertEventRecord = (messageId, censorId, censor_time, successful, message_sent) => {
  const insertQuery = 'INSERT INTO Events (message_id, censor_id, censor_time, successful, message_sent) VALUES (?, ?, ?, ?, ?)';
  const values = [messageId, censorId, censor_time, successful ? 1 : 0, message_sent];

  db.run(insertQuery, values, function (err) {
    if (err) {
      console.error('Error inserting event record:', err.message);
    } else {
      console.log('Inserted event record with ID:', this.lastID);
    }
  });
};

const getDeviceInfo = async (Identifier) => {
  const query = 'SELECT Name, Addres FROM TableDevise WHERE Identifier = ?';
  return new Promise((resolve, reject) => {
    db.get(query, [Identifier], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const sendColumnValuesToTelegram = async (tableName, excludedColumns, rowId, callback) => {
  try {
    const columnNames = await getColumnNames(tableName);

    if (!columnNames.length) {
      throw new Error('No columns found for the specified table.');
    }

    const includedColumns = columnNames.filter(column => !excludedColumns.includes(column));

    const maxMessageIdQuery = 'SELECT MAX(message_id) AS max_message_id FROM events WHERE message_sent = 0';

    const query = `
      SELECT ROWID, Identifier, SensorError, BitError, ${includedColumns.join(', ')}
      FROM ${tableName}
      WHERE Id >= (${maxMessageIdQuery})
    `;

    db.get(query, [], async (err, row) => {
      if (err) {
        console.error('Error retrieving row:', err);
      } else if (row) {
        const deviceInfo = await getDeviceInfo(row.Identifier);
        const deviceError = Boolean(row.SensorError || row.BitError);

        console.log("deviceInfo", deviceError);

        if (deviceError) {
          const messageHeader = `⚠️<b>Device: ${deviceInfo.Name}, Address: ${deviceInfo.Addres}</b>`;
          const messageBody = includedColumns.map(column => `${column}: ${row[column]}`).join('\n');
          const fullMessage = `${messageHeader}\n${messageBody}`;

          await sendTelegramMessage(fullMessage);

          console.log('Message sent successfully.');
          callback(rowId);
        } else {
          console.log('No alert rows to send.');
        }
      } else {
        console.log('No new rows to send.');
      }
    });
  } catch (error) {
    console.error('Error sending column values to Telegram:', error);
  }
};

const tableName = process.env.TABLE_NAME;
const excludedColumns = process.env.EXCLUDED_COLUMNS.split(',');

watchForNewCensorRecords((newCensorRecords) => {
  newCensorRecords.forEach(censorRecord => {
    const rowId = censorRecord.Id;
    const censorId = censorRecord.Identifier;
    const censorTime = censorRecord.TimerOut;
    const successful = true;
    const messageSent = 0;

    const eventExistsQuery = 'SELECT COUNT(*) AS count FROM Events WHERE message_id = ?';
    db.get(eventExistsQuery, [rowId], (err, result) => {
      if (err) {
        console.error('Error checking for existing event:', err.message);
        return;
      }

      const eventExists = result.count > 0;
      console.log("eventExists", eventExists, rowId);

      if (!eventExists) {
        insertEventRecord(rowId, censorId, censorTime, successful, messageSent);
        console.log(`Event with rowId ${rowId} not exists.`);
        sendColumnValuesToTelegram(tableName, excludedColumns, rowId, () => {
          updateEventMessageSentFlag(rowId);
        });
      } else {
        // console.log(`Event with rowId ${rowId} already exists. Skipping message sending.`);
      }
    });
  });
});

const updateEventMessageSentFlag = (parentId) => {
  console.log("======", parentId);
  const updateQuery = 'UPDATE Events SET message_sent = 1 WHERE message_id = ?';
  db.run(updateQuery, [parentId], function (err) {
    if (err) {
      console.error('Error updating event record:', err.message);
    } else {
      console.log('Updated event record with ID:', parentId, 'message_sent set to 1');
    }
  });
};
