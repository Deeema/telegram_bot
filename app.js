import { watchForNewCensorRecords } from './src/db/events.js';
import { sendTelegramMessage } from './src/sendTelegramMessage.js';
import { getColumnNames } from './src/db/getColumnNames.js';
import db from './src/db/database.js';

const insertEventRecord = (messageId, censorId, censor_time, successful) => {
  const insertQuery = 'INSERT INTO Events (message_id, censor_id, censor_time, successful) VALUES (?, ?, ?, ?)';
  const values = [messageId, censorId, censor_time, successful ? 1 : 0];

  db.run(insertQuery, values, function (err) {
    if (err) {
      console.error('Error inserting event record:', err.message);
    } else {
      console.log('Inserted event record with ID:', this.lastID);
    }
  });
};

const getColumnValuesForSpecificRow = (tableName, rowId, columnNames) => {
  const query = `SELECT ${columnNames.join(', ')} FROM ${tableName} WHERE TabNo = ?`;

  return new Promise((resolve, reject) => {
    db.get(query, [rowId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const sendColumnValuesToTelegram = async (tableName, excludedColumns) => {
  try {
    const columnNames = await getColumnNames(tableName);

    if (!columnNames.length) {
      throw new Error('No columns found for the specified table.');
    }

    const includedColumns = columnNames.filter(column => !excludedColumns.includes(column));

    console.log("includedColumns", includedColumns)

    const query = `SELECT ROWID, ${includedColumns.join(', ')} FROM ${tableName} WHERE ROWID > (SELECT MAX(ROWID) FROM Events WHERE message_sent = 1)`;

    db.get(query, [], async (err, row) => {
      if (err) {
        console.error('Error retrieving row:', err);
      } else if (row) {
        const message = includedColumns.map(column => `${column}: ${row[column]}`).join('\n');
        await sendTelegramMessage(message);

        // Mark the message as sent in the events table
        db.run('INSERT INTO Events (message_sent) VALUES (1)');

        console.log('Message sent successfully.');
      } else {
        console.log('No new rows to send.');
      }
    });
  } catch (error) {
    console.error('Error sending column values to Telegram:', error);
  }
};

// Example usage
const tableName = 'TableDataGRP';
const excludedColumns = ['BitSetup', 'FlP_1', 'FlP_2'];  // Specify the columns to be excluded

// Setup the event watcher for new censor records
watchForNewCensorRecords((newCensorRecords) => {
  newCensorRecords.forEach(censorRecord => {
    const parent_id = censorRecord.TabNo;
    const censorId = censorRecord.Identifier;
    const censor_time = censorRecord.TimerOut;
    const successful = true;
    console.log("newCensorRecords.length < parent_id", newCensorRecords.length, parent_id)

    if (newCensorRecords.length <= parent_id) {
      insertEventRecord(parent_id, censorId, censor_time, successful);
      const message = `New event: Message ID ${parent_id}, Censor ID ${censorId}, Successful: ${successful ? 'Yes' : 'No'}`;

      sendColumnValuesToTelegram(tableName, excludedColumns);
    }
  });
});
