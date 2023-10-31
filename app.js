import { watchForNewCensorRecords } from './src/db/events.js';
import { sendTelegramMessage } from './src/sendTelegramMessage.js';
import { getColumnNames } from './src/db/getColumnNames.js';
import db from './src/db/database.js';

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

const sendColumnValuesToTelegram = async (tableName, excludedColumns, rowId, callback) => {
  try {
    const columnNames = await getColumnNames(tableName);

    if (!columnNames.length) {
      throw new Error('No columns found for the specified table.');
    }

    const includedColumns = columnNames.filter(column => !excludedColumns.includes(column));

    // const query = `SELECT ROWID, ${includedColumns.join(', ')} FROM ${tableName} WHERE ROWID > (SELECT MAX(ROWID) FROM events WHERE message_sent = 0)`;
    // const maxMessageIdQuery = 'SELECT MAX(message_id) AS max_message_id FROM events WHERE message_sent = 0';

    const maxMessageIdQuery = 'SELECT MAX(message_id) AS max_message_id FROM events WHERE message_sent = 0';

    const query = `
      SELECT ROWID, ${includedColumns.join(', ')}
      FROM ${tableName}
      WHERE TabNo >= (${maxMessageIdQuery})
    `;

    db.get(query, [], async (err, row) => {
      if (err) {
        console.error('Error retrieving row:', err);
      } else if (row) {
        const message = includedColumns.map(column => `${column}: ${row[column]}`).join('\n');
        await sendTelegramMessage(message);

        console.log('Message sent successfully.');
        // Call the callback after sending the message
        callback(rowId);
      } else {
        console.log('No new rows to send.', row);
      }
    });
  } catch (error) {
    console.error('Error sending column values to Telegram:', error);
  }
};

// Example usage
const tableName = process.env.TABLE_NAME;
const excludedColumns = process.env.EXCLUDED_COLUMNS.split(',');  // Specify the columns to be excluded

watchForNewCensorRecords((newCensorRecords) => {
  newCensorRecords.forEach(censorRecord => {
    const rowId = censorRecord.TabNo;  // Use a single variable for the rowId
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
