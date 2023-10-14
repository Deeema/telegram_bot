import db from './database.js';

const getColumnNamesAndCount = (tableName) => {
  const query = `PRAGMA table_info(${tableName})`;

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const columnNames = rows.map(row => row.name);
        const columnCount = rows.length;
        resolve({ columnNames, columnCount });
      }
    });
  });
};

// Example usage
getColumnNamesAndCount('your_table_name')
  .then(({ columnNames, columnCount }) => {
    console.log('Column Names:', columnNames);
    console.log('Column Count:', columnCount);
  })
  .catch(error => console.error('Error retrieving column names and count:', error));
