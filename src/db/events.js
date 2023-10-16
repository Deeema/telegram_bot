import db from './database.js';

const watchForNewCensorRecords = (callback) => {
    
  const sqlQuery = 'SELECT * FROM TableDataGRP WHERE ROWID > ?';

  let lastProcessedCensorId = 0;
  
  setInterval(() => {
    
    db.all(sqlQuery, [lastProcessedCensorId], (err, rows) => {
      if (err) {
        console.error('Error querying censor records:', err.message);
        return;
      }

      if (rows.length > 0) {        
        lastProcessedCensorId = rows[rows.length - 1].TabNo;
        // console.log("Rowid", rows[0], rows.length, lastProcessedCensorId);
        callback(rows);
      }
    });
  }, 5000); // Adjust the interval as needed
};

export { watchForNewCensorRecords };