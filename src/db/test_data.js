import { exec } from 'child_process';
import schedule from 'node-schedule';

// Define the SQL script to execute
const sqlScript = 'insert_censor_row.sql'; // Replace with the actual filename

// Create a schedule to run the SQL script every 2 minutes
const job = schedule.scheduleJob('*/2 * * * *', () => {
  const cmd = `sqlite3 your_database.db < ${sqlScript}`; // Replace 'your_database.db' with your database file
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing SQL script: ${error}`);
      return;
    }
    console.log('Row inserted successfully.');
  });
});

console.log('Scheduled to insert a row every 2 minutes.');
