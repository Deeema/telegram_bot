import db from "./src/db/database.js"; // Update the path based on your project structure

const createEventsTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Events (
      message_id INTEGER PRIMARY KEY,
      censor_id INTEGER,
      censor_time DATETIME,
      successful INTEGER,
      message_sent INTEGER
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating 'events' table:", err.message);
    } else {
      console.log("Successfully created 'events' table.");
    }
  });
};

// Add any other initialization logic as needed

createEventsTable();