import { watchForNewCensorRecords } from "./src/db/events.js";
import { sendTelegramMessage } from "./src/sendTelegramMessage.js";
import { getColumnNames } from "./src/db/getColumnNames.js";
import db from "./src/db/database.js";
import dotenv from "dotenv";

dotenv.config();

const tableName = process.env.TABLE_NAME;
const intervalTime = process.env.INTERVAL_TIME;
const excludedColumns = process.env.EXCLUDED_COLUMNS.split(",");
let lastAlertSentTime = null;

const insertEventRecord = (messageId, censorId, censor_time, successful, message_sent) => {
  const insertQuery = "INSERT INTO Events (message_id, censor_id, censor_time, successful, message_sent) VALUES (?, ?, ?, ?, ?)";
  const values = [messageId, censorId, censor_time, successful ? 1 : 0, message_sent];

  db.run(insertQuery, values, function (err) {
    if (err) {
      console.error("Error inserting event record:", err.message);
    } else {
      console.log("Inserted event record with ID:", this.lastID);
    }
  });
};

export const getDeviceInfo = async (Identifier) => {
  console.log('getDeviceInfo', Identifier);
  const query = "SELECT Name, Addres FROM TableDevise WHERE Identifier = ?";
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

export const getColumnNamesAndFilter = async (tableName, excludedColumns) => {
  const columnNames = await getColumnNames(tableName);

  if (!columnNames.length) {
    throw new Error("No columns found for the specified table.");
  }

  const includedColumns = columnNames.filter(
    (column) => !excludedColumns.includes(column)
  );

  return includedColumns;
};

const sendAlertMessage = async (deviceInfo, includedColumns, row) => {
  const messageHeader = `⚠️<b>Device: ${deviceInfo.Name}, Address: ${deviceInfo.Addres}</b>`;
  const messageBody = includedColumns.map(column => `${column}: ${row[column]}`).join('\n');
  const fullMessage = `${messageHeader}\n${messageBody}`;

  await sendTelegramMessage(fullMessage);

  console.log("Alert message sent successfully.");
};

const sendColumnValuesToTelegram = async (tableName, excludedColumns, rowId, callback) => {
  try {
    
    const includedColumns = await getColumnNamesAndFilter(
      tableName,
      excludedColumns
    );

    const maxMessageIdQuery = "SELECT MAX(message_id) AS max_message_id FROM events WHERE message_sent = 0";

    const maxMessageIdResult = await new Promise((resolve, reject) => {
      db.get(maxMessageIdQuery, [], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    console.log("maxMessageIdResult:", maxMessageIdResult);

    const query = `
      SELECT ROWID, Identifier, SensorError, BitError, ${includedColumns.join(', ')}
      FROM ${tableName}
      WHERE Id >= (${maxMessageIdQuery})
    `;

    console.log("Checking for new rows...");

    db.get(query, [], async (err, row) => {
      if (err) {
        console.error('Error retrieving row:', err);
      } else if (row) {
        console.log("New row found:", row);
        const deviceInfo = await getDeviceInfo(row.Identifier);
        const deviceError = Boolean(row.SensorError || row.BitError);

        console.log("deviceInfo", deviceError);

        if (deviceError) {
          lastAlertSentTime = new Date();
          await sendAlertMessage(deviceInfo, includedColumns, row);
          callback(rowId);
        } else {
          console.log("No alert rows to send.");
        }
      } else {
        console.log("No new rows to send.");

        if (lastAlertSentTime && new Date() - lastAlertSentTime >= intervalTime * 60 * 60 * 1000) {
          console.log("Sending last normal message after 3 hours.");
          sendLastNormalMessage();
          lastAlertSentTime = null;
        }
      }
    });
  } catch (error) {
    console.error("Error sending column values to Telegram:", error);
  }
};

const sendLastNormalMessage = async () => {
  const maxMessageIdQuery = 'SELECT MAX(message_id) AS max_message_id FROM events WHERE message_sent = 0';
  const query = `
    SELECT ROWID, Identifier, ${includedColumns.join(', ')}
    FROM ${tableName}
    WHERE Id >= (${maxMessageIdQuery})
  `;

  const lastNormalMessageResult = await new Promise((resolve, reject) => {
    db.get(query, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  console.log("lastNormalMessageResult:", lastNormalMessageResult);

  if (lastNormalMessageResult) {
    const deviceInfo = await getDeviceInfo(lastNormalMessageResult.Identifier);

    const includedColumns = await getColumnNamesAndFilter(
      tableName,
      excludedColumns
    );    

    const messageHeader = `<b>Device: ${deviceInfo.Name}, Address: ${deviceInfo.Addres}</b>`;
    const messageBody = includedColumns.map(column => `${column}: ${lastNormalMessageResult[column]}`).join('\n');

    const fullMessage = `${messageHeader}\n${messageBody}`;
    await sendTelegramMessage(fullMessage);

    console.log('Last normal message sent successfully.');
  } else {
    console.log('No last normal message to send.');
  }
};

watchForNewCensorRecords(async (newCensorRecords) => {
  for (const censorRecord of newCensorRecords) {
    const rowId = censorRecord.Id;
    const censorId = censorRecord.Identifier;
    const censorTime = censorRecord.TimerOut;
    const successful = true;
    const messageSent = 0;

    try {
      // Check if the event already exists
      const eventExistsQuery =
        "SELECT COUNT(*) AS count FROM Events WHERE message_id = ?";
      const eventExistsResult = await new Promise((resolve, reject) => {
        db.get(eventExistsQuery, [rowId], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      const eventExists = eventExistsResult.count > 0;

      if (!eventExists) {
        // Insert the event record
        insertEventRecord(rowId, censorId, censorTime, successful, messageSent);
        console.log(`Event with rowId ${rowId} does not exist. Inserted event record.`);

        // Send the column values to Telegram
        await sendColumnValuesToTelegram(tableName, excludedColumns, rowId, async () => {
          // Update the event message_sent flag
          updateEventMessageSentFlag(rowId);
          console.log(`Event with rowId ${rowId} processed successfully.`);
        });
      } else {
        console.log(`Event with rowId ${rowId} already exists. Skipping message sending.`);
      }
    } catch (error) {
      console.error("Error processing new censor record:", error);
    }
  }
});


const updateEventMessageSentFlag = parentId => {
  console.log("Updating event record:", parentId);
  const updateQuery = "UPDATE Events SET message_sent = 1 WHERE message_id = ?";
  db.run(updateQuery, [parentId], function (err) {
    if (err) {
      console.error("Error updating event record:", err.message);
    } else {
      console.log("Updated event record with ID:", parentId, "message_sent set to 1");
    }
  });
};
