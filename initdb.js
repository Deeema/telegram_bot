import db from "./src/db/database.js";
import { doesTableExist } from "./src/db/utils.js"; // Update the path based on your project structure

console.log("Initializing database...");

const createEventsTable = async () => {
  const tableName = "Events";

  try {
    const tableExists = await doesTableExist(tableName);

    if (!tableExists) {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          message_id INTEGER PRIMARY KEY,
          censor_id INTEGER,
          censor_time DATETIME,
          successful INTEGER,
          message_sent INTEGER
        )
      `;

      db.run(createTableQuery, (err) => {
        if (err) {
          console.error(`Error creating '${tableName}' table:`, err.message);
        } else {
          console.log(`Successfully created '${tableName}' table.`);
        }
      });
    } else {
      console.log(`Table '${tableName}' already exists.`);
    }
  } catch (error) {
    console.error("Error checking table existence:", error);
  }
};

// Add any other initialization logic as needed

createEventsTable();