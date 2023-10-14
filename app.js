import { watchForNewCensorRecords } from './src/db/events.js';
import { sendTelegramMessage } from './src/sendTelegramMessage.js';
import { getColumnNames } from './src/db/getColumnNames.js'
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
  
  console.log("message", columnNames);
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

const sendColumnValuesToTelegram = async (tableName, rowId, columnNames) => {
  try {
    const row = await getColumnValuesForSpecificRow(tableName, rowId, columnNames);

    if (!row) {
      throw new Error('Row not found');
    }
    const message = columnNames.map(column => `${column}: ${row[column]}`).join('\n');
    sendTelegramMessage(message);
  } catch (error) {
    console.error('Error sending column values to Telegram:', error);
  }
};

// Example usage
const tableName = 'TableDataGRP';
const rowId = 1;  // Adjust to the desired row ID
const columnNames = await getColumnNames(tableName);  // Replace with actual column names
// const columnNames = ['Identifier', 'Code', 'TimerOut', 'constCSQ'];  // Replace with actual column names

sendColumnValuesToTelegram(tableName, rowId, columnNames);


// Setup the event watcher for new censor records
watchForNewCensorRecords((newCensorRecords) => {
  // console.log("Record", newCensorRecords);  
  newCensorRecords.forEach(censorRecord => {
    // Assuming you have the messageId and censorId from the censorRecord
    const parent_id = censorRecord.TabNo;
    const censorId = censorRecord.Identifier;
    const censor_time = censorRecord.TimerOut;
    const successful = true;

    if ( newCensorRecords.length < parent_id) {
      console.log("++++++", newCensorRecords.length, parent_id);
      insertEventRecord(parent_id, censorId, censor_time, successful);
      const message = `New event: Message ID ${parent_id}, Censor ID ${censorId}, Successful: ${successful ? 'Yes' : 'No'}`;
      
      sendColumnValuesToTelegram(tableName, rowId, columnNames);
      // sendTelegramMessage(message);
    } 
  });
});
