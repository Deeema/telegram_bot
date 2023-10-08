import { watchForNewCensorRecords } from './src/db/events.js';
import { sendTelegramMessage } from './src/sendTelegramMessage.js';
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

// Setup the event watcher for new censor records
watchForNewCensorRecords((newCensorRecords) => {
  // console.log("Record", newCensorRecords);  
  newCensorRecords.forEach(censorRecord => {
    // Assuming you have the messageId and censorId from the censorRecord
    const parent_id = censorRecord.TabNo;
    const censorId = censorRecord.Identifier;
    const censor_time = censorRecord.TimerOut;
    const successful = true;

    console.log("newCensorRecords", newCensorRecords.length, parent_id);
    if ( newCensorRecords.length <= parent_id) {
      console.log("++++++");
      insertEventRecord(parent_id, censorId, censor_time, successful);
    } 
    const message = `New event: Message ID ${parent_id}, Censor ID ${censorId}, Successful: ${successful ? 'Yes' : 'No'}`;
    sendTelegramMessage(message);
  });
});
